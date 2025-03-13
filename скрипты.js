// Массив для хранения элементов
let items = [];
let currentFilter = 'all';
let isSorted = false;

// GitHub API конфигурация
const githubConfig = {
    username: 'Relben00',
    repo: 'Site',
    path: 'danns.json',
    token: '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' // Обратите внимание на безопасность!
};

// Функция для получения элементов DOM после загрузки страницы
function initializeDOM() {
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
    
    // Открыть модальное окно при нажатии на кнопку добавления
    if (addButton) {
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
    }

    // Обработчик кнопки сортировки
    if (sortButton) {
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
    }

    // Показать/скрыть опции фильтра
    if (filterButton && filterOptions) {
        filterButton.addEventListener('click', () => {
            filterOptions.style.display = filterOptions.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Закрыть опции фильтра при клике вне
    document.addEventListener('click', (event) => {
        if (filterOptions && !event.target.closest('.filter-btn') && !event.target.closest('.filter-options')) {
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
            if (filterButton) {
                filterButton.textContent = 'Фильтр: ' + option.textContent;
            }

            // Скрываем опции фильтра
            if (filterOptions) {
                filterOptions.style.display = 'none';
            }

            // Обновляем галерею
            renderGallery();
        });
    });

    // Поиск по названию
    if (searchBox) {
        searchBox.addEventListener('input', () => {
            renderGallery();
        });
    }

    // Закрыть модальные окна
    if (closeModal && itemModal) {
        closeModal.addEventListener('click', () => {
            itemModal.style.display = 'none';
        });
    }

    if (closeDeleteModal && deleteModal) {
        closeDeleteModal.addEventListener('click', () => {
            deleteModal.style.display = 'none';
        });
    }

    if (cancelDelete && deleteModal) {
        cancelDelete.addEventListener('click', () => {
            deleteModal.style.display = 'none';
        });
    }

    // Закрыть модальные окна при клике вне их
    window.addEventListener('click', (event) => {
        if (itemModal && event.target === itemModal) {
            itemModal.style.display = 'none';
        }
        if (deleteModal && event.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });

    // Обработчик сохранения
    if (saveItem) {
        saveItem.addEventListener('click', async () => {
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
                if (itemModal) {
                    itemModal.style.display = 'none';
                }
            } else {
                alert('Пожалуйста, заполните все обязательные поля');
            }
        });
    }

    // Обработчик подтверждения удаления
    if (confirmDelete) {
        confirmDelete.addEventListener('click', async () => {
            const id = document.getElementById('deleteItemId').value;
            
            // Удаляем элемент
            await deleteItemFromJSON(id);
            
            // Закрываем модальное окно
            if (deleteModal) {
                deleteModal.style.display = 'none';
            }
        });
    }
}

// Функция для загрузки данных из GitHub
async function loadFromGitHub() {
    try {
        const { username, repo, path, token } = githubConfig;
        
        // Проверяем, что токен не пустой
        if (!token || token === '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') {
            throw new Error('GitHub токен не установлен или недействителен');
        }
        
        // Получаем файл
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.status === 200) {
            const fileInfo = await response.json();
            
            // Проверяем, что получен корректный ответ
            if (!fileInfo.content) {
                throw new Error('Получен некорректный ответ от GitHub API');
            }
            
            // Декодируем содержимое из base64
            const content = decodeURIComponent(escape(atob(fileInfo.content)));
            const data = JSON.parse(content);
            
            return data;
        } else if (response.status === 404) {
            return [];
        } else {
            throw new Error(`Ошибка GitHub API: ${response.status}`);
        }
    } catch (error) {
        // Загружаем из localStorage как резервную копию
        const storedItems = localStorage.getItem('galleryItems');
        if (storedItems) {
            try {
                return JSON.parse(storedItems);
            } catch (parseError) {
                return [];
            }
        }
        return [];
    }
}

// Функция для сохранения данных в GitHub
async function saveToGitHub(data) {
    try {
        const { username, repo, path, token } = githubConfig;
        
        // Проверяем, что токен не пустой
        if (!token || token === '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E') {
            throw new Error('GitHub токен не установлен или недействителен');
        }
        
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
            return true;
        } else {
            throw new Error(`Ошибка GitHub API при сохранении: ${updateResponse.status}`);
        }
    } catch (error) {
        // Сохраняем локально как резервную копию
        localStorage.setItem('galleryItems', JSON.stringify(data));
        return false;
    }
}

// Функция для сохранения или обновления элемента
async function saveItemToJSON(item) {
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
        renderGallery(); // Обновляем галерею только после успешного сохранения
        return true;
    } catch (error) {
        renderGallery(); // Обновляем галерею в любом случае
        return false;
    }
}

// Функция для удаления элемента
async function deleteItemFromJSON(id) {
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
        renderGallery(); // Обновляем галерею только после успешного сохранения
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
    const deleteItemId = document.getElementById('deleteItemId');
    const deleteModal = document.getElementById('deleteModal');
    
    if (deleteItemId && deleteModal) {
        deleteItemId.value = id;
        deleteModal.style.display = 'block';
    }
}

// Функция для открытия страницы элемента
function openItemPage(id) {
    const item = items.find(item => item.id === id);
    if (item) {
        // Присоединяем параметры к URL
        const itemPageUrl = 'Инфо.html?id=' + encodeURIComponent(item.id);
        window.open(itemPageUrl, '_blank');
    }
}

// Функция для отображения галереи
function renderGallery() {
    const gallery = document.getElementById('gallery');
    if (!gallery) {
        return;
    }
    
    gallery.innerHTML = '';
    
    // Применяем фильтрацию
    let displayItems = items;
    
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
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            editItem(item.id);
        });
        
        // Обработчик клика для удаления
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showDeleteConfirmation(item.id);
        });
        
        // Обработчик клика на изображение или заголовок для открытия страницы
        itemImage.addEventListener('click', () => {
            openItemPage(item.id);
        });
        
        itemTitle.addEventListener('click', () => {
            openItemPage(item.id);
        });
        
        gallery.appendChild(itemElement);
    });
}

// Функция для автоматического сохранения данных
function setupAutoSave() {
    // Сохраняем данные каждые 5 минут
    setInterval(async () => {
        if (items.length > 0) {
            await saveToGitHub(items);
        }
    }, 5 * 60 * 1000); // 5 минут
}

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    // Инициализируем элементы DOM
    initializeDOM();
    
    // Загружаем данные из GitHub
    try {
        items = await loadFromGitHub();
        renderGallery();
    } catch (error) {
        // Если не удалось загрузить из GitHub, используем localStorage
        const storedItems = localStorage.getItem('galleryItems');
        if (storedItems) {
            try {
                items = JSON.parse(storedItems);
            } catch (e) {
                items = [];
            }
        } else {
            items = [];
        }
        renderGallery();
    }
    
    // Настраиваем автоматическое сохранение
    setupAutoSave();
});
