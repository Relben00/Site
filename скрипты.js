// скрипты.js
// Конфигурация Supabase - замените на свои данные
const SUPABASE_URL = 'https://YOUR_SUPABASE_URL.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Массив для хранения элементов
let items = [];
let filteredItems = [];
let currentFilter = 'all';
let isSorted = false;

// Получаем элементы DOM
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
const authButton = document.getElementById('authButton');

// Обработчик кнопки аутентификации
authButton.addEventListener('click', () => {
    loginWithGitHub();
});

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM loaded, checking auth status...");
    try {
        // Проверяем статус аутентификации
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error) {
            console.error("Auth error:", error);
            loadFromLocalStorage();
            return;
        }
        
        if (user) {
            // Пользователь авторизован, загружаем данные из Supabase
            console.log("User authenticated:", user.email);
            authButton.textContent = 'Выйти';
            authButton.removeEventListener('click', loginWithGitHub);
            authButton.addEventListener('click', logout);
            
            await loadDataFromSupabase();
        } else {
            // Пользователь не авторизован, используем localStorage
            console.log("User not authenticated, using localStorage");
            loadFromLocalStorage();
        }
    } catch (error) {
        console.error("Error during initialization:", error);
        loadFromLocalStorage();
    }
});

// Функция для входа через GitHub
async function loginWithGitHub() {
    console.log("Attempting GitHub login...");
    try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) {
            console.error('Ошибка авторизации:', error);
            alert('Не удалось авторизоваться через GitHub');
        }
    } catch (error) {
        console.error("Error during GitHub login:", error);
        alert('Произошла ошибка при попытке авторизации');
    }
}

// Функция для выхода из системы
async function logout() {
    console.log("Logging out...");
    try {
        await supabaseClient.auth.signOut();
        authButton.textContent = 'Войти через GitHub';
        authButton.removeEventListener('click', logout);
        authButton.addEventListener('click', loginWithGitHub);
        
        // Загружаем данные из localStorage
        loadFromLocalStorage();
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

// Функция для сохранения элемента в Supabase
async function saveItemToSupabase(item) {
    console.log("Saving item to Supabase:", item.id);
    try {
        const { error } = await supabaseClient
            .from('gallery_items')
            .upsert([item], { onConflict: 'id' });
        
        if (error) {
            console.error("Supabase save error:", error);
            throw error;
        }
        
        console.log('Данные успешно сохранены в Supabase');
        // Резервное сохранение
        localStorage.setItem('galleryItems', JSON.stringify(items));
        return true;
    } catch (error) {
        console.error('Ошибка при сохранении в Supabase:', error);
        alert('Не удалось сохранить данные в облаке. Данные сохранены локально.');
        localStorage.setItem('galleryItems', JSON.stringify(items));
        return false;
    }
}

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

// Функция для определения типа первого символа в строке
function getCharType(str) {
    if (!str || str.length === 0) return 'other';

    const firstChar = str.charAt(0).toLowerCase();

    // Проверяем, является ли символ специальным
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?0-9]/.test(firstChar)) {
        return 'symbol';
    }

    // Проверяем, является ли символ английской буквой
    if (/[a-z]/.test(firstChar)) {
        return 'english';
    }

    // Проверяем, является ли символ русской буквой
    if (/[а-яё]/.test(firstChar)) {
        return 'russian';
    }

    // Если ничего из вышеперечисленного, то это другой символ
    return 'other';
}

// Функция для сортировки элементов
function sortItems(items) {
    return [...items].sort((a, b) => {
        const titleA = a.title.trim().toLowerCase();
        const titleB = b.title.trim().toLowerCase();

        const typeA = getCharType(titleA);
        const typeB = getCharType(titleB);

        // Порядок типов: символы, английский, русский, другие
        const typeOrder = {
            'symbol': 1,
            'english': 2,
            'russian': 3,
            'other': 4
        };

        // Сначала сортируем по типу
        if (typeOrder[typeA] !== typeOrder[typeB]) {
            return typeOrder[typeA] - typeOrder[typeB];
        }

        // Если типы одинаковые, сортируем по алфавиту
        return titleA.localeCompare(titleB);
    });
}

// Открыть модальное окно при нажатии на кнопку добавления
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

// Закрыть опции фильтра при клике вне
document.addEventListener('click', (event) => {
    if (!event.target.closest('.filter-btn') && !event.target.closest('.filter-options')) {
        filterOptions.style.display = 'none';
    }
});

// Обработчики для опций фильтра
document.querySelectorAll('.filter-option').forEach(option => {
    option.addEventListener('click', () => {
        currentFilter = option.dataset.filter;

        // Обновляем активный класс
        document.querySelectorAll('.filter-option').forEach(opt => {
            opt.classList.remove('active-filter');
        });
        option.classList.add('active-filter');

        // Обновляем текст кнопки фильтра
        filterButton.textContent = 'Фильтр: ' + option.textContent;

        // Скрываем опции фильтра
        filterOptions.style.display = 'none';

        // Обновляем галерею
        renderGallery();
    });
});

// Поиск по названию
searchBox.addEventListener('input', () => {
    renderGallery();
});

// Закрыть модальные окна
closeModal.addEventListener('click', () => {
    itemModal.style.display = 'none';
});

closeDeleteModal.addEventListener('click', () => {
    deleteModal.style.display = 'none';
});

cancelDelete.addEventListener('click', () => {
    deleteModal.style.display = 'none';
});

// Закрыть модальные окна при клике вне их
window.addEventListener('click', (event) => {
    if (event.target === itemModal) {
        itemModal.style.display = 'none';
    }
    if (event.target === deleteModal) {
        deleteModal.style.display = 'none';
    }
});

// Модифицированный обработчик сохранения
saveItem.addEventListener('click', async () => {
    const id = document.getElementById('itemId').value;
    const title = document.getElementById('itemTitle').value;
    const imageUrl = document.getElementById('itemImage').value;
    const content = document.getElementById('itemContent').value;

    if (title && imageUrl) {
        const newId = id || Date.now().toString();
        const itemData = { id: newId, title, imageUrl, content };
        
        // Обновляем локальный массив
        if (id) {
            const index = items.findIndex(item => item.id === id);
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

    // Применяем фильтры к элементам
    filteredItems = filterItems(items);

    // Применяем сортировку, если включена
    if (isSorted) {
        filteredItems = sortItems(filteredItems);
    }

    // Если нет элементов для отображения, показываем сообщение
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

        // Находим элементы внутри созданного элемента
        const itemImage = itemElement.querySelector('img');
        const itemTitle = itemElement.querySelector('.title');
        const editBtn = itemElement.querySelector('.edit-btn');
        const deleteBtn = itemElement.querySelector('.delete-btn');

        // Обработчик клика для перехода на страницу
        itemImage.addEventListener('click', (e) => {
            e.stopPropagation();
            openItemPage(item.id);
        });

        itemTitle.addEventListener('click', (e) => {
            e.stopPropagation();
            openItemPage(item.id);
        });

        // Обработчик клика для редактирования
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editItem(item.id);
        });

        // Обработчик клика для удаления
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteConfirmation(item.id);
        });

        gallery.appendChild(itemElement);
    });
}

// Функция для открытия формы редактирования
function editItem(id) {
    const item = items.find(item => item.id === id);
    if (item) {
        // Заполняем форму данными элемента
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemTitle').value = item.title;
        document.getElementById('itemImage').value = item.imageUrl;
        document.getElementById('itemContent').value = item.content || '';

        // Меняем заголовок модального окна
        modalTitle.textContent = 'Редактировать элемент';

        // Отображаем модальное окно
        itemModal.style.display = 'block';
    }
}

// Функция для отображения подтверждения удаления
function showDeleteConfirmation(id) {
    document.getElementById('deleteItemId').value = id;
    deleteModal.style.display = 'block';
}

// Модифицированный обработчик подтверждения удаления
confirmDelete.addEventListener('click', async () => {
    const id = document.getElementById('deleteItemId').value;

    // Удаляем элемент из массива
    items = items.filter(item => item.id !== id);

    try {
        // Проверяем, авторизован ли пользователь
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (user) {
            // Удаляем из Supabase
            await deleteItemFromSupabase(id);
        }
    } catch (error) {
        console.error("Error during delete:", error);
    }
    
    // Обновляем localStorage в любом случае
    localStorage.setItem('galleryItems', JSON.stringify(items));

    // Обновляем галерею
    renderGallery();

    // Закрываем модальное окно
    deleteModal.style.display = 'none';
});

// Функция для открытия страницы элемента
function openItemPage(id) {
    const item = items.find(item => item.id === id);
    if (item) {
        // Присоединяем параметры к URL
        const itemPageUrl = 'Инфо.html?id=' + encodeURIComponent(item.id);
        window.open(itemPageUrl, '_blank');
    }
}
