// скрипты.js
// Конфигурация Supabase - замените на свои данные
const SUPABASE_URL = 'https://lfrkxefyupvaascdnotz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxmcmt4ZWZ5dXB2YWFzY2Rub3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NTUzMDcsImV4cCI6MjA1NzIzMTMwN30.Uum8Otz649sgbiLOGa9hdbsoLPya0CIuYQHk5mHJpwU';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Массив для хранения элементов
let items = [];
let filteredItems = [];
let currentFilter = 'all';
let isSorted = false;

// Получаем элементы DOM
// Добавьте в начало где другие DOM-элементы
const addButton = document.getElementById('addButton');
const sortButton = document.getElementById('sortButton');
const filterButton = document.getElementById('filterButton');
const filterOptions = document.getElementById('filterOptions');
const searchBox = document.getElementById('searchBox');
const itemModal = document.getElementById('itemModal');
const deleteModal = document.getElementById('deleteModal');
const closeModal = document.getElementById('closeModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const saveItem = document.getElementById('saveItem');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
const gallery = document.getElementById('gallery');
const modalTitle = document.getElementById('modalTitle');

// Обработчик кнопки аутентификации
authButton.addEventListener('click', () => {
    authModal.style.display = 'block';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
});

// Обработчик кнопки добавления
addButton.addEventListener('click', () => {
    // Сбрасываем поля формы
    document.getElementById('itemId').value = '';
    document.getElementById('itemTitle').value = '';
    document.getElementById('itemImage').value = '';
    document.getElementById('itemContent').value = '';

    // Меняем заголовок модального окна
    modalTitle.textContent = 'Добавить новый элемент';

    // Отображаем модальное окно
    itemModal.style.display = 'block';
});

// Обработчик кнопки сортировки
sortButton.addEventListener('click', () => {
    isSorted = !isSorted;

    if (isSorted) {
        sortButton.textContent = 'Отменить сортировку';
        sortButton.style.backgroundColor = '#ff9800';
    } else {
        sortButton.textContent = 'Сортировка';
        sortButton.style.backgroundColor = '#2196F3';
    }

    renderGallery();
});

// Показать/скрыть опции фильтра
filterButton.addEventListener('click', () => {
    filterOptions.style.display = filterOptions.style.display === 'block' ? 'none' : 'block';
});

// Обработчик сохранения элемента
saveItem.addEventListener('click', async () => {
    const id = document.getElementById('itemId').value;
    const title = document.getElementById('itemTitle').value;
    const imageUrl = document.getElementById('itemImage').value;
    const content = document.getElementById('itemContent').value;

    if (title && imageUrl) {
        const newId = id ? parseInt(id) : Date.now();
        const itemData = { id: newId, title, imageUrl, content };
        
        // Обновляем локальный массив
        if (id) {
            const index = items.findIndex(item => item.id === parseInt(id));
            if (index !== -1) {
                items[index] = itemData;
            }
        } else {
            items.push(itemData);
        }

        // Проверяем, авторизован ли пользователь
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (user) {
            // Сохраняем в Supabase
            await saveItemToSupabase(itemData);
        } else {
            // Сохраняем только в localStorage
            localStorage.setItem('galleryItems', JSON.stringify(items));
        }

        // Обновляем галерею
        renderGallery();

        // Закрываем модальное окно
        itemModal.style.display = 'none';
    } else {
        alert('Пожалуйста, заполните все обязательные поля');
    }
});

// Закрыть модальное окно
closeAuthModal.addEventListener('click', () => {
    authModal.style.display = 'none';
});

// Переключение между формами
switchToRegister.addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
});

switchToLogin.addEventListener('click', () => {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
});

// Вход по email и паролю
loginButton.addEventListener('click', async () => {
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    
    if (!email || !password) {
        loginError.textContent = 'Пожалуйста, введите email и пароль';
        return;
    }
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        console.log('Успешный вход:', data);
        authModal.style.display = 'none';
        
        // Обновляем кнопку и загружаем данные
        authButton.textContent = 'Выйти';
        authButton.removeEventListener('click', showAuthModal);
        authButton.addEventListener('click', logout);
        
        // Загружаем данные из Supabase
        await loadDataFromSupabase();
        
    } catch (error) {
        console.error('Ошибка входа:', error);
        loginError.textContent = 'Ошибка входа: ' + error.message;
    }
});

// Регистрация
registerButton.addEventListener('click', async () => {
    const email = document.getElementById('newUserEmail').value;
    const password = document.getElementById('newUserPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;
    
    if (!email || !password) {
        registerError.textContent = 'Пожалуйста, заполните все поля';
        return;
    }
    
    if (password !== confirmPass) {
        registerError.textContent = 'Пароли не совпадают';
        return;
    }
    
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password
        });
        
        if (error) throw error;
        
        console.log('Успешная регистрация:', data);
        registerError.textContent = '';
        
        // Показываем сообщение об успешной регистрации
        alert('Регистрация успешна! Проверьте свою почту для подтверждения.');
        
        // Переключаемся на форму входа
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        registerError.textContent = 'Ошибка регистрации: ' + error.message;
    }
});

// Функция для выхода из системы
async function logout() {
    try {
        await supabaseClient.auth.signOut();
        
        // Обновляем UI
        authButton.textContent = 'Войти';
        authButton.removeEventListener('click', logout);
        authButton.addEventListener('click', showAuthModal); // Используем функцию showAuthModal напрямую
        
        // Добавить перезагрузку для полной очистки сессии
        setTimeout(() => {
            window.location.reload();
        }, 500);
    } catch (error) {
        console.error('Ошибка при выходе:', error);
    }
}

// Функция для проверки авторизации при загрузке
async function checkAuth() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (user) {
            console.log('Пользователь авторизован:', user.email);
            authButton.textContent = 'Выйти';
            authButton.removeEventListener('click', showAuthModal);
            authButton.addEventListener('click', logout);
            
            // Загружаем данные из Supabase
            await loadDataFromSupabase();
        } else {
            console.log('Пользователь не авторизован');
            // Загружаем данные из localStorage
            loadFromLocalStorage();
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        loadFromLocalStorage();
    }
}

// Функция для отображения модального окна авторизации
function showAuthModal() {
    authModal.style.display = 'block';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
}

// Модифицированный обработчик загрузки страницы
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM loaded, checking auth status...");
    await checkAuth();
});

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Проверяем, авторизован ли пользователь
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (user) {
            console.log("User authenticated:", user.email);
            // Обновляем кнопку аутентификации
            authButton.textContent = 'Выйти';
            authButton.removeEventListener('click', showAuthModal);
            authButton.addEventListener('click', logout);
            
            // Загружаем данные из Supabase
            await loadDataFromSupabase();
        } else {
            console.log("User not authenticated");
            // Загружаем данные из localStorage
            loadFromLocalStorage();
        }
    } catch (error) {
        console.error("Error during initialization:", error);
        // В случае ошибки загружаем из localStorage
        loadFromLocalStorage();
    }
});

// Функция для показа модального окна авторизации
function showAuthModal() {
    authModal.style.display = 'block';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
}

// Функция для выхода из системы
async function logout() {
    console.log("Logging out...");
    try {
        // Полностью очищаем сессию
        await supabaseClient.auth.signOut({ scope: 'global' });
        
        // Очищаем локальное хранилище от токенов авторизации
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.removeItem('supabase.auth.token');
        
        // Обновляем кнопку
        authButton.textContent = 'Войти';
        authButton.removeEventListener('click', logout);
        authButton.addEventListener('click', showAuthModal);
        
        // Загружаем данные из localStorage
        loadFromLocalStorage();
        
        // Перезагружаем страницу для полной очистки сессии
        setTimeout(() => {
            window.location.reload();
        }, 500);
        
        console.log("Logout complete");
    } catch (error) {
        console.error("Error during logout:", error);
    }
}

// Загрузка из localStorage
function loadFromLocalStorage() {
    console.log("Loading data from localStorage");
    const storedItems = localStorage.getItem('galleryItems');
    if (storedItems) {
        items = JSON.parse(storedItems);
    } else {
        items = [];
    }
    renderGallery();
}

// Функция для загрузки данных из Supabase
async function loadDataFromSupabase() {
    console.log("Loading data from Supabase");
    try {
        const { data, error } = await supabaseClient
            .from('gallery_items')
            .select('*');
        
        if (error) {
            console.error("Supabase data load error:", error);
            throw error;
        }
        
        console.log("Data loaded from Supabase:", data?.length || 0, "items");
        items = data || [];
        // Сохраняем копию в localStorage для резервного копирования
        localStorage.setItem('galleryItems', JSON.stringify(items));
        renderGallery();
    } catch (error) {
        console.error('Ошибка при загрузке данных из Supabase:', error);
        // Если не удалось загрузить, используем localStorage
        loadFromLocalStorage();
    }
}
// Функция для фильтрации элементов
function filterItems(items) {
    const searchQuery = searchBox.value.toLowerCase().trim();

    return items.filter(item => {
        // Фильтрация по поисковому запросу
        const matchesSearch = item.title.toLowerCase().includes(searchQuery);

        // Фильтрация по типу
        let matchesFilter = true;
        if (currentFilter !== 'all') {
            matchesFilter = getCharType(item.title) === currentFilter;
        }

        return matchesSearch && matchesFilter;
    });
}

// Функция для отображения галереи
function renderGallery() {
    gallery.innerHTML = '';

    // Применяем фильтры и сортировку
    filteredItems = filterItems(items);
    if (isSorted) {
        filteredItems = sortItems(filteredItems);
    }

    // Если нет элементов для отображения
    if (filteredItems.length === 0) {
        gallery.innerHTML = '<div class="no-results">Нет элементов для отображения</div>';
        return;
    }

    filteredItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.dataset.id = item.id;

        itemElement.innerHTML = `
            <div class="item-actions">
                <button class="edit-btn" title="Редактировать">✎</button>
                <button class="delete-btn" title="Удалить">×</button>
            </div>
            <img src="${item.imageUrl}" alt="${item.title}">
            <div class="title">${item.title}</div>
        `;

        // Добавляем обработчики событий
        const itemImage = itemElement.querySelector('img');
        const itemTitle = itemElement.querySelector('.title');
        const editBtn = itemElement.querySelector('.edit-btn');
        const deleteBtn = itemElement.querySelector('.delete-btn');

        itemImage.addEventListener('click', (e) => {
            e.stopPropagation();
            openItemPage(item.id);
        });

        itemTitle.addEventListener('click', (e) => {
            e.stopPropagation();
            openItemPage(item.id);
        });

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editItem(item.id);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteConfirmation(item.id);
        });

        gallery.appendChild(itemElement);
    });
}

// Функция для открытия формы редактирования
function editItem(id) {
    id = parseInt(id);
    const item = items.find(item => item.id === id);
    if (item) {
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemTitle').value = item.title;
        document.getElementById('itemImage').value = item.imageUrl;
        document.getElementById('itemContent').value = item.content || '';
        modalTitle.textContent = 'Редактировать элемент';
        itemModal.style.display = 'block';
    }
}

// Функция для отображения подтверждения удаления
function showDeleteConfirmation(id) {
    document.getElementById('deleteItemId').value = parseInt(id);
    deleteModal.style.display = 'block';
}

// Обработчик подтверждения удаления
confirmDelete.addEventListener('click', async () => {
    const id = parseInt(document.getElementById('deleteItemId').value);
    items = items.filter(item => item.id !== id);

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
            await deleteItemFromSupabase(id);
        }
    } catch (error) {
        console.error("Error during delete:", error);
    }
    
    localStorage.setItem('galleryItems', JSON.stringify(items));
    renderGallery();
    deleteModal.style.display = 'none';
});

// Добавьте обработчики для модальных окон
closeModal.addEventListener('click', () => {
    itemModal.style.display = 'none';
});

closeDeleteModal.addEventListener('click', () => {
    deleteModal.style.display = 'none';
});

cancelDelete.addEventListener('click', () => {
    deleteModal.style.display = 'none';
});

// Функция для удаления элемента из Supabase
async function deleteItemFromSupabase(id) {
    try {
        const { error } = await supabaseClient
            .from('gallery_items')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        console.log('Элемент успешно удален из Supabase');
    } catch (error) {
        console.error('Ошибка при удалении из Supabase:', error);
        alert('Не удалось удалить данные из облака. Данные удалены только локально.');
    }
}

// Функция для сортировки элементов
function sortItems(items) {
    return [...items].sort((a, b) => {
        const titleA = a.title.trim().toLowerCase();
        const titleB = b.title.trim().toLowerCase();
        
        const typeA = getCharType(titleA);
        const typeB = getCharType(titleB);
        
        const typeOrder = {
            'symbol': 1,
            'english': 2,
            'russian': 3,
            'other': 4
        };
        
        if (typeOrder[typeA] !== typeOrder[typeB]) {
            return typeOrder[typeA] - typeOrder[typeB];
        }
        
        return titleA.localeCompare(titleB);
    });
}

// Функция для определения типа первого символа в строке
function getCharType(str) {
    if (!str || str.length === 0) return 'other';
    
    const firstChar = str.charAt(0).toLowerCase();
    
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?0-9]/.test(firstChar)) {
        return 'symbol';
    }
    if (/[a-z]/.test(firstChar)) {
        return 'english';
    }
    if (/[а-яё]/.test(firstChar)) {
        return 'russian';
    }
    return 'other';
}

// Функция для открытия страницы элемента
function openItemPage(id) {
    id = parseInt(id);
    const item = items.find(item => item.id === id);
    if (item) {
        window.open('Инфо.html?id=' + encodeURIComponent(item.id), '_blank');
    }
}
