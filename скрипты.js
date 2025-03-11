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
const authModal = document.getElementById('authModal');
const closeAuthModal = document.getElementById('closeAuthModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');

// Обработчик кнопки аутентификации
authButton.addEventListener('click', () => {
    authModal.style.display = 'block';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
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
        authButton.addEventListener('click', () => {
            authModal.style.display = 'block';
        });
        
        // Загружаем данные из localStorage
        loadFromLocalStorage();
        
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

// Функция для открытия страницы элемента
function openItemPage(id) {
    id = parseInt(id);
    const item = items.find(item => item.id === id);
    if (item) {
        window.open('Инфо.html?id=' + encodeURIComponent(item.id), '_blank');
    }
}
