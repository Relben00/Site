// Массив для хранения элементов
let items = [];
let currentFilter = 'all';
let isSorted = false;

// GitHub API конфигурация
const githubConfig = {
    username: 'Relben00',
    repo: 'Site',
    path: 'danns.json',
    token: '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'
};

// Функция для диагностики элементов DOM
function diagnoseDOM() {
    console.log("ДИАГНОСТИКА DOM:");
    
    // Список всех важных элементов для проверки
    const elements = [
        'addButton', 'sortButton', 'filterButton', 'filterOptions',
        'searchBox', 'itemModal', 'deleteModal', 'closeModal',
        'closeDeleteModal', 'saveItem', 'cancelDelete', 'confirmDelete',
        'gallery', 'modalTitle'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`${id}: ${element ? "НАЙДЕН" : "НЕ НАЙДЕН"}`);
    });
}

// Инициализация обработчиков событий для кнопок
function initButtons() {
    console.log("ИНИЦИАЛИЗАЦИЯ КНОПОК:");
    
    // Кнопка добавления
    const addButton = document.getElementById('addButton');
    if (addButton) {
        console.log("Настройка кнопки добавления");
        addButton.onclick = function() {
            console.log("Нажата кнопка добавления");
            
            // Сбрасываем поля формы
            const idInput = document.getElementById('itemId');
            const titleInput = document.getElementById('itemTitle');
            const imageInput = document.getElementById('itemImage');
            const contentInput = document.getElementById('itemContent');
            const modalTitle = document.getElementById('modalTitle');
            
            if (idInput) idInput.value = '';
            if (titleInput) titleInput.value = '';
            if (imageInput) imageInput.value = '';
            if (contentInput) contentInput.value = '';
            
            // Меняем заголовок модального окна
            if (modalTitle) modalTitle.textContent = 'Добавить новый элемент';
            
            // Отображаем модальное окно
            const itemModal = document.getElementById('itemModal');
            if (itemModal) {
                itemModal.style.display = 'block';
            } else {
                console.error("Модальное окно не найдено!");
            }
        };
    } else {
        console.error("Кнопка добавления не найдена!");
    }
    
    // Кнопка сортировки
    const sortButton = document.getElementById('sortButton');
    if (sortButton) {
        console.log("Настройка кнопки сортировки");
        sortButton.onclick = function() {
            console.log("Нажата кнопка сортировки");
            
            isSorted = !isSorted;
            
            if (isSorted) {
                sortButton.textContent = 'Отменить сортировку';
                sortButton.style.backgroundColor = '#ff9800';
            } else {
                sortButton.textContent = 'Сортировка';
                sortButton.style.backgroundColor = '#2196F3';
            }
            
            renderGallery();
        };
    } else {
        console.error("Кнопка сортировки не найдена!");
    }
    
    // Кнопка фильтра
    const filterButton = document.getElementById('filterButton');
    const filterOptions = document.getElementById('filterOptions');
    
    if (filterButton) {
        console.log("Настройка кнопки фильтра");
        filterButton.onclick = function() {
            console.log("Нажата кнопка фильтра");
            
            if (filterOptions) {
                filterOptions.style.display = filterOptions.style.display === 'block' ? 'none' : 'block';
            } else {
                console.error("Элемент опций фильтра не найден!");
            }
        };
    } else {
        console.error("Кнопка фильтра не найдена!");
    }
    
    // Опции фильтра
    document.querySelectorAll('.filter-option').forEach(option => {
        option.onclick = function() {
            console.log("Выбрана опция фильтра:", this.textContent);
            
            currentFilter = this.dataset.filter;
            
            // Обновляем активный класс
            document.querySelectorAll('.filter-option').forEach(opt => {
                opt.classList.remove('active-filter');
            });
            this.classList.add('active-filter');
            
            // Обновляем текст кнопки фильтра
            if (filterButton) {
                filterButton.textContent = 'Фильтр: ' + this.textContent;
            }
            
            // Скрываем опции фильтра
            if (filterOptions) {
                filterOptions.style.display = 'none';
            }
            
            renderGallery();
        };
    });
    
    // Поле поиска
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        console.log("Настройка поля поиска");
        searchBox.oninput = function() {
            console.log("Ввод в поле поиска");
            renderGallery();
        };
    } else {
        console.error("Поле поиска не найдено!");
    }
    
    // Кнопка сохранения элемента
    const saveItem = document.getElementById('saveItem');
    if (saveItem) {
        console.log("Настройка кнопки сохранения");
        saveItem.onclick = async function() {
            console.log("Нажата кнопка сохранения");
            
            const id = document.getElementById('itemId').value;
            const title = document.getElementById('itemTitle').value;
            const imageUrl = document.getElementById('itemImage').value;
            const content = document.getElementById('itemContent').value;
            
            if (title && imageUrl) {
                const newId = id || Date.now().toString();
                const itemData = { id: newId, title, imageUrl, content };
                
                // Сохраняем элемент
                await saveItemToJSON(itemData);
                
                // Закрываем модальное окно
                const itemModal = document.getElementById('itemModal');
                if (itemModal) {
                    itemModal.style.display = 'none';
                }
            } else {
                alert('Пожалуйста, заполните все обязательные поля');
            }
        };
    } else {
        console.error("Кнопка сохранения не найдена!");
    }
    
    // Кнопки закрытия модальных окон
    const closeModal = document.getElementById('closeModal');
    const itemModal = document.getElementById('itemModal');
    
    if (closeModal && itemModal) {
        console.log("Настройка кнопки закрытия модального окна");
        closeModal.onclick = function() {
            console.log("Нажата кнопка закрытия модального окна");
            itemModal.style.display = 'none';
        };
    } else {
        console.error("Кнопка закрытия модального окна не найдена!");
    }
    
    // Кнопки модального окна удаления
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');
    const deleteModal = document.getElementById('deleteModal');
    
    if (closeDeleteModal && deleteModal) {
        console.log("Настройка кнопки закрытия окна удаления");
        closeDeleteModal.onclick = function() {
            console.log("Нажата кнопка закрытия окна удаления");
            deleteModal.style.display = 'none';
        };
    } else {
        console.error("Кнопка закрытия окна удаления не найдена!");
    }
    
    if (cancelDelete && deleteModal) {
        console.log("Настройка кнопки отмены удаления");
        cancelDelete.onclick = function() {
            console.log("Нажата кнопка отмены удаления");
            deleteModal.style.display = 'none';
        };
    } else {
        console.error("Кнопка отмены удаления не найдена!");
    }
    
    if (confirmDelete && deleteModal) {
        console.log("Настройка кнопки подтверждения удаления");
        confirmDelete.onclick = async function() {
            console.log("Нажата кнопка подтверждения удаления");
            
            const id = document.getElementById('deleteItemId').value;
            await deleteItemFromJSON(id);
            
            // Закрываем модальное окно
            deleteModal.style.display = 'none';
        };
    } else {
        console.error("Кнопка подтверждения удаления не найдена!");
    }
    
    // Закрытие модальных окон при клике вне их
    window.onclick = function(event) {
        if (event.target === itemModal) {
            itemModal.style.display = 'none';
        }
        if (event.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    };
}

// Функция для загрузки данных из GitHub
async function loadFromGitHub() {
    console.log("Загрузка данных из GitHub...");
    
    try {
        const { username, repo, path, token } = githubConfig;
        
        // Получаем файл
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        console.log("Ответ GitHub API:", response.status);
        
        if (response.status === 200) {
            const fileInfo = await response.json();
            
            // Декодируем содержимое из base64
            const content = decodeURIComponent(escape(atob(fileInfo.content)));
            const data = JSON.parse(content);
            
            console.log(`Загружено ${data.length} элементов из GitHub`);
            return data;
        } else if (response.status === 404) {
            console.log("Файл не найден в GitHub, создаем пустой список");
            return [];
        } else {
            throw new Error(`Ошибка GitHub API: ${response.status}`);
        }
    } catch (error) {
        console.error("Ошибка при загрузке из GitHub:", error);
        
        // Загружаем из localStorage как резервную копию
        const storedItems = localStorage.getItem('galleryItems');
        if (storedItems) {
            try {
                const data = JSON.parse(storedItems);
                console.log(`Загружено ${data.length} элементов из localStorage`);
                return data;
            } catch (parseError) {
                console.error("Ошибка при разборе JSON из localStorage:", parseError);
                return [];
            }
        }
        
        return [];
    }
}

// Функция для сохранения данных в GitHub
async function saveToGitHub(data) {
    console.log("Сохранение данных в GitHub...");
    
    try {
        const { username, repo, path, token } = githubConfig;
        
        // Сначала получаем текущий файл, чтобы получить его SHA
        const getResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        let sha = '';
        if (getResponse.status === 200) {
            const fileInfo = await getResponse.json();
            sha = fileInfo.sha;
        }
        
        // Подготавливаем данные для сохранения
        const content = JSON.stringify(data, null, 2);
        const encodedContent = btoa(unescape(encodeURIComponent(content)));
        
        // Обновляем или создаем файл
        const updateResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: 'Обновление данных галереи',
                content: encodedContent,
                sha: sha || undefined
            })
        });
        
        if (updateResponse.status === 200 || updateResponse.status === 201) {
            console.log("Данные успешно сохранены в GitHub");
            return true;
        } else {
            console.error("Ошибка при сохранении в GitHub:", updateResponse.status);
            throw new Error(`Ошибка GitHub API при сохранении: ${updateResponse.status}`);
        }
    } catch (error) {
        console.error("Ошибка при сохранении в GitHub:", error);
        
        // Сохраняем локально как резервную копию
        localStorage.setItem('galleryItems', JSON.stringify(data));
        
        return false;
    }
}

// Функция для сохранения или обновления элемента
async function saveItemToJSON(item) {
    console.log("Сохранение элемента:", item);
    
    // Проверяем валидность элемента
    if (!item || !item.id || !item.title || !item.imageUrl) {
        alert('Элемент содержит не все обязательные поля');
        return false;
    }
    
    // Обновляем локальный массив items
    const index = items.findIndex(i => i.id === item.id);
    if (index !== -1) {
        items[index] = item;
    } else {
        items.push(item);
    }
    
    // Сохраняем в localStorage в любом случае
    localStorage.setItem('galleryItems', JSON.stringify(items));
    
    // Сохраняем в GitHub
    try {
        await saveToGitHub(items);
        renderGallery(); // Обновляем галерею
        return true;
    } catch (error) {
        renderGallery(); // Обновляем галерею в любом случае
        return false;
    }
}

// Функция для удаления элемента
async function deleteItemFromJSON(id) {
    console.log("Удаление элемента с ID:", id);
    
    if (!id) {
        alert('ID элемента не указан');
        return false;
    }
    
    // Удаляем элемент из массива
    items = items.filter(item => item.id !== id);
    
    // Сохраняем обновленный массив в localStorage
    localStorage.setItem('galleryItems', JSON.stringify(items));
    
    // Сохраняем в GitHub
    try {
        await saveToGitHub(items);
        renderGallery(); // Обновляем галерею
        return true;
    } catch (error) {
        renderGallery(); // Обновляем галерею в любом случае
        return false;
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

    return 'other';
}

// Функция для сортировки элементов
function sortItems(itemsToSort) {
    return [...itemsToSort].sort((a, b) => {
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

// Функция для открытия формы редактирования
function editItem(id) {
    console.log("Редактирование элемента с ID:", id);
    
    const item = items.find(item => item.id === id);
    if (item) {
        // Заполняем форму данными элемента
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemTitle').value = item.title;
        document.getElementById('itemImage').value = item.imageUrl;
        document.getElementById('itemContent').value = item.content || '';

        // Меняем заголовок модального окна
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = 'Редактировать элемент';
        }

        // Отображаем модальное окно
        const itemModal = document.getElementById('itemModal');
        if (itemModal) {
            itemModal.style.display = 'block';
        }
    }
}

// Функция для отображения подтверждения удаления
function showDeleteConfirmation(id) {
    console.log("Подтверждение удаления элемента с ID:", id);
    
    const deleteItemId = document.getElementById('deleteItemId');
    const deleteModal = document.getElementById('deleteModal');
    
    if (deleteItemId && deleteModal) {
        deleteItemId.value = id;
        deleteModal.style.display = 'block';
    }
}

// Функция для открытия страницы элемента
function openItemPage(id) {
    console.log("Открытие страницы элемента с ID:", id);
    
    const item = items.find(item => item.id === id);
    if (item) {
        // Присоединяем параметры к URL
        const itemPageUrl = 'Инфо.html?id=' + encodeURIComponent(item.id);
        window.open(itemPageUrl, '_blank');
    }
}

// Функция для отображения галереи
function renderGallery() {
    console.log("Отображение галереи...");
    
    const gallery = document.getElementById('gallery');
    if (!gallery) {
        console.error('Элемент gallery не найден!');
        return;
    }
    
    gallery.innerHTML = '';
    
    // Применяем фильтрацию
    let displayItems = [...items];
    
    // Фильтрация по поисковому запросу
    const searchBox = document.getElementById('searchBox');
    const searchQuery = searchBox ? searchBox.value.toLowerCase().trim() : '';
    if (searchQuery) {
        displayItems = displayItems.filter(item => 
            item.title.toLowerCase().includes(searchQuery) || 
            (item.content && item.content.toLowerCase().includes(searchQuery))
        );
    }
    
    // Фильтрация по типу
    if (currentFilter !== 'all') {
        displayItems = displayItems.filter(item => getCharType(item.title) === currentFilter);
    }
    
    // Применяем сортировку
    if (isSorted) {
        displayItems = sortItems(displayItems);
    }
    
    // Если нет элементов для отображения
    if (displayItems.length === 0) {
        gallery.innerHTML = '<div class="no-items">Нет элементов для отображения</div>';
        return;
    }
    
    // Отображаем элементы
    displayItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'gallery-item';
        itemElement.dataset.id = item.id;
        
        itemElement.innerHTML = `
            <div class="item-actions">
                <button class="edit-btn" title="Редактировать">✎</button>
                <button class="delete-btn" title="Удалить">×</button>
            </div>
            <img src="${item.imageUrl}" alt="${item.title}" class="item-image">
            <div class="item-title">${item.title}</div>
            <div class="item-content">${item.content || ''}</div>
        `;
        
        // Находим элементы внутри созданного элемента
        const itemImage = itemElement.querySelector('.item-image');
        const itemTitle = itemElement.querySelector('.item-title');
        const editBtn = itemElement.querySelector('.edit-btn');
        const deleteBtn = itemElement.querySelector('.delete-btn');
        
        // Обработчик клика для редактирования
        editBtn.onclick = function(e) {
            e.stopPropagation();
            editItem(item.id);
        };
        
        // Обработчик клика для удаления
        deleteBtn.onclick = function(e) {
            e.stopPropagation();
            showDeleteConfirmation(item.id);
        };
        
        // Обработчик клика на изображение или заголовок для открытия страницы
        itemImage.onclick = function() {
            openItemPage(item.id);
        };
        
        itemTitle.onclick = function() {
            openItemPage(item.id);
        };
        
        gallery.appendChild(itemElement);
    });
}

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    console.log("DOM загружен, начинаем инициализацию...");
    
    // Диагностика DOM-элементов
    diagnoseDOM();
    
    // Инициализация кнопок
    initButtons();
    
    // Загрузка данных из GitHub
    try {
        items = await loadFromGitHub();
        console.log(`Загружено ${items.length} элементов`);
    } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        
        // Если не удалось загрузить из GitHub, используем localStorage
        const storedItems = localStorage.getItem('galleryItems');
        if (storedItems) {
            try {
                items = JSON.parse(storedItems);
                console.log(`Загружено ${items.length} элементов из localStorage`);
            } catch (e) {
                console.error("Ошибка при разборе данных из localStorage:", e);
                items = [];
            }
        } else {
            console.log("Данные не найдены, создаем пустой массив");
            items = [];
        }
    }
    
    // Отображаем галерею
    renderGallery();
    
    console.log("Инициализация завершена");
});

// Дополнительная проверка после полной загрузки страницы
window.onload = function() {
    console.log("Страница полностью загружена, повторная проверка кнопок...");
    diagnoseDOM();
    initButtons();
};
