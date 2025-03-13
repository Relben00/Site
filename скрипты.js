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

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM загружен");
    
    // Инициализация кнопок
    initButtons();
    
    // Загрузка данных
    loadInitialData();
});

// Функция для загрузки начальных данных
async function loadInitialData() {
    console.log("Загрузка начальных данных...");
    
    try {
        // Попытка загрузить данные из localStorage
        const storedData = localStorage.getItem('galleryItems');
        if (storedData) {
            try {
                items = JSON.parse(storedData);
                console.log("Данные загружены из localStorage:", items);
            } catch (e) {
                console.error("Ошибка при разборе данных из localStorage:", e);
                items = [];
            }
        }
        
        // Отображаем галерею с данными из localStorage
        renderGallery();
        
    } catch (error) {
        console.error("Ошибка при загрузке начальных данных:", error);
        items = [];
        renderGallery();
    }
}

// Инициализация кнопок
function initButtons() {
    console.log("Инициализация кнопок...");
    
    // Кнопка добавления
    const addButton = document.getElementById('addButton');
    if (addButton) {
        addButton.onclick = function() {
            console.log("Нажата кнопка добавления");
            
            // Сбрасываем форму
            document.getElementById('itemId').value = '';
            document.getElementById('itemTitle').value = '';
            document.getElementById('itemImage').value = '';
            document.getElementById('itemContent').value = '';
            
            // Меняем заголовок
            document.getElementById('modalTitle').textContent = 'Добавить новый элемент';
            
            // Показываем модальное окно
            document.getElementById('itemModal').style.display = 'block';
        };
    } else {
        console.error("Кнопка добавления не найдена");
    }
    
    // Кнопка сортировки
    const sortButton = document.getElementById('sortButton');
    if (sortButton) {
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
        console.error("Кнопка сортировки не найдена");
    }
    
    // Кнопка фильтра
    const filterButton = document.getElementById('filterButton');
    const filterOptions = document.getElementById('filterOptions');
    
    if (filterButton && filterOptions) {
        filterButton.onclick = function() {
            console.log("Нажата кнопка фильтра");
            
            filterOptions.style.display = filterOptions.style.display === 'block' ? 'none' : 'block';
        };
    } else {
        console.error("Кнопка фильтра или опции не найдены");
    }
    
    // Опции фильтра
    document.querySelectorAll('.filter-option').forEach(option => {
        option.onclick = function() {
            currentFilter = this.dataset.filter;
            console.log("Выбран фильтр:", currentFilter);
            
            document.querySelectorAll('.filter-option').forEach(opt => {
                opt.classList.remove('active-filter');
            });
            this.classList.add('active-filter');
            
            if (filterButton) {
                filterButton.textContent = 'Фильтр: ' + this.textContent;
            }
            
            if (filterOptions) {
                filterOptions.style.display = 'none';
            }
            
            renderGallery();
        };
    });
    
    // Поле поиска
    const searchBox = document.getElementById('searchBox');
    if (searchBox) {
        searchBox.oninput = function() {
            console.log("Поиск:", this.value);
            renderGallery();
        };
    } else {
        console.error("Поле поиска не найдено");
    }
    
    // Кнопка сохранения элемента
    const saveItem = document.getElementById('saveItem');
    if (saveItem) {
        saveItem.onclick = function() {
            console.log("Нажата кнопка сохранения элемента");
            
            const id = document.getElementById('itemId').value;
            const title = document.getElementById('itemTitle').value;
            const imageUrl = document.getElementById('itemImage').value;
            const content = document.getElementById('itemContent').value;
            
            if (!title || !imageUrl) {
                alert('Пожалуйста, заполните все обязательные поля');
                return;
            }
            
            // Создаем новый элемент или обновляем существующий
            const newId = id || Date.now().toString();
            const itemData = { id: newId, title, imageUrl, content };
            
            // Обновляем массив
            if (id) {
                const index = items.findIndex(item => item.id === id);
                if (index !== -1) {
                    items[index] = itemData;
                } else {
                    items.push(itemData);
                }
            } else {
                items.push(itemData);
            }
            
            // Сохраняем в localStorage
            localStorage.setItem('galleryItems', JSON.stringify(items));
            
            // Закрываем модальное окно
            document.getElementById('itemModal').style.display = 'none';
            
            // Обновляем галерею
            renderGallery();
            
            // Сохраняем в GitHub
            saveToGitHub(items).then(success => {
                if (success) {
                    showNotification("Данные успешно сохранены", "success");
                } else {
                    showNotification("Данные сохранены только локально", "warning");
                }
            });
        };
    } else {
        console.error("Кнопка сохранения элемента не найдена");
    }
    
    // Кнопки закрытия модальных окон
    const closeModal = document.getElementById('closeModal');
    const itemModal = document.getElementById('itemModal');
    if (closeModal && itemModal) {
        closeModal.onclick = function() {
            itemModal.style.display = 'none';
        };
    }
    
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const deleteModal = document.getElementById('deleteModal');
    if (closeDeleteModal && deleteModal) {
        closeDeleteModal.onclick = function() {
            deleteModal.style.display = 'none';
        };
    }
    
    const cancelDelete = document.getElementById('cancelDelete');
    if (cancelDelete && deleteModal) {
        cancelDelete.onclick = function() {
            deleteModal.style.display = 'none';
        };
    }
    
    // Кнопка подтверждения удаления
    const confirmDelete = document.getElementById('confirmDelete');
    if (confirmDelete && deleteModal) {
        confirmDelete.onclick = function() {
            console.log("Подтверждение удаления");
            
            const id = document.getElementById('deleteItemId').value;
            if (!id) return;
            
            // Удаляем элемент из массива
            items = items.filter(item => item.id !== id);
            
            // Сохраняем обновленный массив
            localStorage.setItem('galleryItems', JSON.stringify(items));
            
            // Закрываем модальное окно
            deleteModal.style.display = 'none';
            
            // Обновляем галерею
            renderGallery();
            
            // Сохраняем в GitHub
            saveToGitHub(items).then(success => {
                if (success) {
                    showNotification("Элемент удален", "success");
                } else {
                    showNotification("Элемент удален локально", "warning");
                }
            });
        };
    } else {
        console.error("Кнопка подтверждения удаления не найдена");
    }
    
    // Кнопки для работы с JSON
    const saveJsonButton = document.getElementById('saveJsonButton');
    if (saveJsonButton) {
        saveJsonButton.onclick = function() {
            console.log("Нажата кнопка сохранения в JSON");
            
            showLoadingIndicator("Сохранение данных в JSON...");
            
            saveToGitHub(items).then(success => {
                hideLoadingIndicator();
                
                if (success) {
                    showNotification("Данные успешно сохранены в JSON", "success");
                } else {
                    showNotification("Ошибка при сохранении в JSON", "error");
                }
            });
        };
    } else {
        console.error("Кнопка сохранения в JSON не найдена");
    }
    
    const loadJsonButton = document.getElementById('loadJsonButton');
    if (loadJsonButton) {
        loadJsonButton.onclick = function() {
            console.log("Нажата кнопка загрузки из JSON");
            
            showLoadingIndicator("Загрузка данных из JSON...");
            
            loadFromGitHub().then(data => {
                hideLoadingIndicator();
                
                if (data && data.length > 0) {
                    items = data;
                    localStorage.setItem('galleryItems', JSON.stringify(items));
                    renderGallery();
                    showNotification(`Загружено ${items.length} элементов`, "success");
                } else {
                    showNotification("Нет данных для загрузки или ошибка", "warning");
                }
            }).catch(error => {
                hideLoadingIndicator();
                showNotification("Ошибка при загрузке данных: " + error.message, "error");
            });
        };
    } else {
        console.error("Кнопка загрузки из JSON не найдена");
    }
    
    // Закрытие модальных окон при клике вне
    window.onclick = function(event) {
        if (itemModal && event.target === itemModal) {
            itemModal.style.display = 'none';
        }
        if (deleteModal && event.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    };
}

// Функция для отображения галереи
function renderGallery() {
    console.log("Отображение галереи...");
    
    const gallery = document.getElementById('gallery');
    if (!gallery) {
        console.error("Элемент gallery не найден");
        return;
    }
    
    // Очищаем галерею
    gallery.innerHTML = '';
    
    console.log("Элементы для отображения:", items);
    
    // Если нет элементов
    if (!items || items.length === 0) {
        gallery.innerHTML = '<div class="no-items">Нет элементов для отображения</div>';
        return;
    }
    
    // Применяем фильтрацию
    let displayItems = [...items];
    
    // Фильтрация по поиску
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
    
    console.log(`Отображение ${displayItems.length} из ${items.length} элементов`);
    
    // Если нет элементов после фильтрации
    if (displayItems.length === 0) {
        gallery.innerHTML = '<div class="no-items">Нет элементов для отображения</div>';
        return;
    }
    
    // Отображаем элементы
    displayItems.forEach(item => {
        console.log("Создание элемента:", item);
        
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
        
        gallery.appendChild(itemElement);
        
        // Находим кнопки внутри созданного элемента
        const editBtn = itemElement.querySelector('.edit-btn');
        const deleteBtn = itemElement.querySelector('.delete-btn');
        const itemImage = itemElement.querySelector('.item-image');
        const itemTitle = itemElement.querySelector('.item-title');
        
        // Добавляем обработчики событий
        editBtn.onclick = function(e) {
            e.stopPropagation();
            editItem(item.id);
        };
        
        deleteBtn.onclick = function(e) {
            e.stopPropagation();
            showDeleteConfirmation(item.id);
        };
        
        itemImage.onclick = function() {
            openItemPage(item.id);
        };
        
        itemTitle.onclick = function() {
            openItemPage(item.id);
        };
    });
    
    console.log("Галерея обновлена");
}

// Функция для редактирования элемента
function editItem(id) {
    console.log("Редактирование элемента с ID:", id);
    
    const item = items.find(item => item.id === id);
    if (!item) {
        console.error("Элемент с ID", id, "не найден");
        return;
    }
    
    // Заполняем форму данными элемента
    document.getElementById('itemId').value = item.id;
    document.getElementById('itemTitle').value = item.title;
    document.getElementById('itemImage').value = item.imageUrl;
    document.getElementById('itemContent').value = item.content || '';
    
    // Меняем заголовок
    document.getElementById('modalTitle').textContent = 'Редактировать элемент';
    
    // Показываем модальное окно
    document.getElementById('itemModal').style.display = 'block';
}

// Функция для отображения подтверждения удаления
function showDeleteConfirmation(id) {
    console.log("Подтверждение удаления для ID:", id);
    
    document.getElementById('deleteItemId').value = id;
    document.getElementById('deleteModal').style.display = 'block';
}

// Функция для открытия страницы элемента
function openItemPage(id) {
    console.log("Открытие страницы для ID:", id);
    
    const itemPageUrl = 'Инфо.html?id=' + encodeURIComponent(id);
    window.open(itemPageUrl, '_blank');
}

// Функция для определения типа первого символа
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

// Функция для сортировки элементов
function sortItems(itemsToSort) {
    return [...itemsToSort].sort((a, b) => {
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
            
            if (!fileInfo.content) {
                throw new Error("Содержимое файла не найдено");
            }
            
            try {
                // Декодируем содержимое из base64
                const content = decodeURIComponent(escape(atob(fileInfo.content)));
                const data = JSON.parse(content);
                
                console.log("Загружены данные:", data);
                return Array.isArray(data) ? data : [data];
                
            } catch (parseError) {
                console.error("Ошибка при разборе JSON:", parseError);
                throw new Error("Не удалось разобрать JSON из GitHub");
            }
        } else if (response.status === 404) {
            console.log("Файл не найден в GitHub");
            return [];
        } else {
            const errorText = await response.text();
            console.error("Ошибка GitHub API:", errorText);
            throw new Error(`Ошибка GitHub API: ${response.status}`);
        }
    } catch (error) {
        console.error("Ошибка при загрузке из GitHub:", error);
        throw error;
    }
}

// Функция для сохранения данных в GitHub
async function saveToGitHub(data) {
    console.log("Сохранение данных в GitHub...");
    
    try {
        const { username, repo, path, token } = githubConfig;
        
        // Сначала получаем SHA существующего файла, если он есть
        const getResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        let sha = null;
        if (getResponse.status === 200) {
            const fileInfo = await getResponse.json();
            sha = fileInfo.sha;
            console.log("Получен SHA существующего файла:", sha);
        }
        
        // Подготавливаем данные для сохранения
        const content = JSON.stringify(data, null, 2);
        const encodedContent = btoa(unescape(encodeURIComponent(content)));
        
        // Создаем тело запроса
        const requestBody = {
            message: 'Обновление данных галереи',
            content: encodedContent
        };
        
        // Добавляем SHA только если файл уже существует
        if (sha) {
            requestBody.sha = sha;
        }
        
        // Обновляем или создаем файл
        const updateResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log("Ответ при сохранении:", updateResponse.status);
        
        if (updateResponse.status === 200 || updateResponse.status === 201) {
            console.log("Данные успешно сохранены в GitHub");
            return true;
        } else {
            const errorText = await updateResponse.text();
            console.error("Ошибка при сохранении:", errorText);
            throw new Error(`Ошибка GitHub API при сохранении: ${updateResponse.status}`);
        }
    } catch (error) {
        console.error("Ошибка при сохранении в GitHub:", error);
        return false;
    }
}

// Функция для отображения индикатора загрузки
function showLoadingIndicator(message) {
    console.log("Показ индикатора загрузки:", message);
    
    let loadingIndicator = document.getElementById('loadingIndicator');
    
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loadingIndicator';
        loadingIndicator.className = 'loading-indicator';
        document.body.appendChild(loadingIndicator);
    }
    
    loadingIndicator.textContent = message || 'Загрузка...';
    loadingIndicator.style.display = 'block';
}

// Функция для скрытия индикатора загрузки
function hideLoadingIndicator() {
    console.log("Скрытие индикатора загрузки");
    
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

// Функция для отображения уведомления
function showNotification(message, type) {
    console.log("Показ уведомления:", message, type);
    
    const notification = document.createElement('div');
    notification.className = 'notification ' + (type || 'info');
    notification.textContent = message;
    
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '4px';
    notification.style.color = 'white';
    notification.style.zIndex = '9999';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    
    // Цвет в зависимости от типа
    if (type === 'success') {
        notification.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#f44336';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#ff9800';
    } else {
        notification.style.backgroundColor = '#2196F3';
    }
    
    document.body.appendChild(notification);
    
    // Удаляем через 3 секунды
    setTimeout(function() {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        
        setTimeout(function() {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}
