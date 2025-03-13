// Массив для хранения элементов
let items = [];
let currentFilter = 'all';
let isSorted = false;

// GitHub API конфигурация без токена
const githubConfig = {
    username: 'Relben00',
    repo: 'Site',
    path: 'danns.json'
    // Токен будет запрашиваться отдельно
};

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM загружен");
    
    // Инициализация кнопок
    initButtons();
    
    // Проверяем, сохранен ли токен
    checkGitHubToken();
    
    // Загрузка данных
    loadInitialData();
});

// Функция для проверки наличия токена
function checkGitHubToken() {
    const token = localStorage.getItem('githubToken');
    
    // Добавляем индикатор статуса токена
    const header = document.querySelector('.header');
    if (header) {
        let tokenStatus = document.getElementById('tokenStatus');
        
        if (!tokenStatus) {
            tokenStatus = document.createElement('div');
            tokenStatus.id = 'tokenStatus';
            tokenStatus.style.marginLeft = '10px';
            tokenStatus.style.display = 'inline-block';
            tokenStatus.style.padding = '5px 10px';
            tokenStatus.style.borderRadius = '3px';
            tokenStatus.style.cursor = 'pointer';
            
            header.appendChild(tokenStatus);
        }
        
        if (token) {
            tokenStatus.textContent = 'GitHub: Подключен';
            tokenStatus.style.backgroundColor = '#4CAF50';
            tokenStatus.style.color = 'white';
        } else {
            tokenStatus.textContent = 'GitHub: Не подключен';
            tokenStatus.style.backgroundColor = '#f44336';
            tokenStatus.style.color = 'white';
        }
        
        // При клике на статус показываем форму для ввода токена
        tokenStatus.onclick = function() {
            showTokenInputForm();
        };
    }
    
    return !!token;
}

// Функция для отображения формы ввода токена
function showTokenInputForm() {
    // Удаляем существующее модальное окно, если оно есть
    let existingModal = document.getElementById('tokenModal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // Создаем модальное окно для ввода токена
    const tokenModal = document.createElement('div');
    tokenModal.className = 'modal';
    tokenModal.id = 'tokenModal';
    tokenModal.style.display = 'block';
    tokenModal.style.position = 'fixed';
    tokenModal.style.zIndex = '1000';
    tokenModal.style.left = '0';
    tokenModal.style.top = '0';
    tokenModal.style.width = '100%';
    tokenModal.style.height = '100%';
    tokenModal.style.overflow = 'auto';
    tokenModal.style.backgroundColor = 'rgba(0,0,0,0.4)';
    
    // Создаем содержимое модального окна
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = '#fefefe';
    modalContent.style.margin = '15% auto';
    modalContent.style.padding = '20px';
    modalContent.style.border = '1px solid #888';
    modalContent.style.maxWidth = '500px';
    modalContent.style.borderRadius = '5px';
    
    // Заголовок
    const modalHeader = document.createElement('h2');
    modalHeader.textContent = 'Настройка GitHub токена';
    
    // Описание
    const modalDescription = document.createElement('p');
    modalDescription.textContent = 'Введите ваш персональный токен GitHub для работы с репозиторием. ' +
        'Токен будет сохранен только в вашем браузере и не будет отправлен на сервер.';
    
    // Поле ввода
    const tokenInput = document.createElement('input');
    tokenInput.type = 'password';
    tokenInput.id = 'githubTokenInput';
    tokenInput.placeholder = 'Введите GitHub токен';
    tokenInput.style.width = '100%';
    tokenInput.style.padding = '8px';
    tokenInput.style.marginBottom = '15px';
    tokenInput.style.boxSizing = 'border-box';
    tokenInput.value = localStorage.getItem('githubToken') || '';
    
    // Инструкция по получению токена
    const tokenInstruction = document.createElement('p');
    tokenInstruction.innerHTML = 'Для создания токена перейдите в <a href="https://github.com/settings/tokens" target="_blank">настройки GitHub</a> и выберите "Generate new token". Выберите разрешение "repo".';
    tokenInstruction.style.fontSize = '0.9em';
    tokenInstruction.style.color = '#666';
    
    // Кнопки
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.marginTop = '20px';
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Отмена';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.backgroundColor = '#9e9e9e';
    cancelButton.style.color = 'white';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';
    
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Удалить токен';
    clearButton.style.padding = '8px 16px';
    clearButton.style.backgroundColor = '#f44336';
    clearButton.style.color = 'white';
    clearButton.style.border = 'none';
    clearButton.style.borderRadius = '4px';
    clearButton.style.cursor = 'pointer';
    
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Сохранить';
    saveButton.style.padding = '8px 16px';
    saveButton.style.backgroundColor = '#4CAF50';
    saveButton.style.color = 'white';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '4px';
    saveButton.style.cursor = 'pointer';
    
    // Добавляем все элементы в модальное окно
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(clearButton);
    buttonContainer.appendChild(saveButton);
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalDescription);
    modalContent.appendChild(tokenInput);
    modalContent.appendChild(tokenInstruction);
    modalContent.appendChild(buttonContainer);
    
    tokenModal.appendChild(modalContent);
    document.body.appendChild(tokenModal);
    
    // Фокус на поле ввода
    tokenInput.focus();
    
    // Обработчики событий
    cancelButton.onclick = function() {
        document.body.removeChild(tokenModal);
    };
    
    clearButton.onclick = function() {
        localStorage.removeItem('githubToken');
        document.body.removeChild(tokenModal);
        updateTokenStatus(false);
        showNotification("GitHub токен удален", "info");
    };
    
    saveButton.onclick = function() {
        const token = tokenInput.value.trim();
        
        if (token) {
            // Показываем индикатор загрузки
            showLoadingIndicator("Проверка токена...");
            
            // Проверяем токен
            testGitHubToken(token).then(valid => {
                hideLoadingIndicator();
                
                if (valid) {
                    localStorage.setItem('githubToken', token);
                    document.body.removeChild(tokenModal);
                    updateTokenStatus(true);
                    showNotification("GitHub токен сохранен и действителен", "success");
                } else {
                    showNotification("GitHub токен недействителен", "error");
                    // Оставляем форму открытой для исправления
                }
            });
        } else {
            showNotification("Токен не может быть пустым", "error");
        }
    };
    
    // Закрытие модального окна при клике вне его
    tokenModal.onclick = function(event) {
        if (event.target === tokenModal) {
            document.body.removeChild(tokenModal);
        }
    };
    
    // Обработка нажатия Enter
    tokenInput.onkeydown = function(e) {
        if (e.key === 'Enter') {
            saveButton.click();
        }
    };
}

// Функция для обновления статуса токена
function updateTokenStatus(isConnected) {
    const tokenStatus = document.getElementById('tokenStatus');
    if (tokenStatus) {
        if (isConnected) {
            tokenStatus.textContent = 'GitHub: Подключен';
            tokenStatus.style.backgroundColor = '#4CAF50';
        } else {
            tokenStatus.textContent = 'GitHub: Не подключен';
            tokenStatus.style.backgroundColor = '#f44336';
        }
    }
}

// Функция для проверки валидности токена
async function testGitHubToken(token) {
    try {
        const { username } = githubConfig;
        
        const response = await fetch(`https://api.github.com/repos/${username}/${githubConfig.repo}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        return response.status === 200;
    } catch (error) {
        console.error("Ошибка при проверке токена:", error);
        return false;
    }
}

// Функция для загрузки начальных данных
async function loadInitialData() {
    console.log("Загрузка начальных данных...");
    
    try {
        showLoadingIndicator("Загрузка данных...");
        
        // Проверяем наличие токена
        const token = localStorage.getItem('githubToken');
        let dataLoaded = false;
        
        // Если токен есть, пытаемся загрузить из GitHub
        if (token) {
            try {
                const data = await loadFromGitHub(token);
                if (data && data.length > 0) {
                    items = data;
                    localStorage.setItem('galleryItems', JSON.stringify(items));
                    dataLoaded = true;
                    console.log("Данные загружены из GitHub:", items);
                }
            } catch (e) {
                console.error("Ошибка при загрузке из GitHub:", e);
            }
        }
        
        // Если не удалось загрузить из GitHub, пробуем из localStorage
        if (!dataLoaded) {
            const storedData = localStorage.getItem('galleryItems');
            if (storedData) {
                try {
                    items = JSON.parse(storedData);
                    console.log("Данные загружены из localStorage:", items);
                    dataLoaded = true;
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
        hideLoadingIndicator();
        
    } catch (error) {
        console.error("Ошибка при загрузке начальных данных:", error);
        hideLoadingIndicator();
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
            
            // Если есть токен, сохраняем и в GitHub
            const token = localStorage.getItem('githubToken');
            if (token) {
                showLoadingIndicator("Сохранение данных в GitHub...");
                
                saveToGitHub(items, token).then(success => {
                    hideLoadingIndicator();
                    
                    if (success) {
                        showNotification("Элемент сохранен в GitHub", "success");
                    } else {
                        showNotification("Элемент сохранен только локально", "warning");
                    }
                });
            } else {
                showNotification("Элемент сохранен локально", "success");
            }
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
            
            // Если есть токен, сохраняем и в GitHub
            const token = localStorage.getItem('githubToken');
            if (token) {
                showLoadingIndicator("Сохранение изменений в GitHub...");
                
                saveToGitHub(items, token).then(success => {
                    hideLoadingIndicator();
                    
                    if (success) {
                        showNotification("Элемент удален в GitHub", "success");
                    } else {
                        showNotification("Элемент удален только локально", "warning");
                    }
                });
            } else {
                showNotification("Элемент удален локально", "success");
            }
        };
    } else {
        console.error("Кнопка подтверждения удаления не найдена");
    }
    
    // Кнопки для работы с JSON
    const saveJsonButton = document.getElementById('saveJsonButton');
    if (saveJsonButton) {
        saveJsonButton.onclick = function() {
            console.log("Сохранение данных в GitHub");
            
            // Проверяем наличие токена
            const token = localStorage.getItem('githubToken');
            if (!token) {
                showNotification("Для сохранения данных требуется GitHub токен", "warning");
                showTokenInputForm();
                return;
            }
            
            // Проверяем наличие данных для сохранения
            if (!items || items.length === 0) {
                showNotification("Нет данных для сохранения", "warning");
                return;
            }
            
            showLoadingIndicator("Сохранение данных в GitHub...");
            
            saveToGitHub(items, token).then(success => {
                hideLoadingIndicator();
                
                if (success) {
                    showNotification("Данные успешно сохранены в GitHub", "success");
                } else {
                    showNotification("Ошибка при сохранении в GitHub", "error");
                }
            });
        };
    } else {
        console.error("Кнопка сохранения в JSON не найдена");
    }
    
    const loadJsonButton = document.getElementById('loadJsonButton');
    if (loadJsonButton) {
        loadJsonButton.onclick = function() {
            console.log("Загрузка данных из GitHub");
            
            // Проверяем наличие токена
            const token = localStorage.getItem('githubToken');
            if (!token) {
                showNotification("Для загрузки данных требуется GitHub токен", "warning");
                showTokenInputForm();
                return;
            }
            
            showLoadingIndicator("Загрузка данных из GitHub...");
            
            loadFromGitHub(token).then(data => {
                hideLoadingIndicator();
                
                if (data && data.length > 0) {
                    items = data;
                    localStorage.setItem('galleryItems', JSON.stringify(items));
                    renderGallery();
                    showNotification(`Загружено ${items.length} элементов из GitHub`, "success");
                } else {
                    showNotification("Нет данных для загрузки или файл пуст", "warning");
                }
            }).catch(error => {
                hideLoadingIndicator();
                showNotification("Ошибка при загрузке данных: " + error.message, "error");
            });
        };
    } else {
        console.error("Кнопка загрузки из JSON не найдена");
    }
    
    // Закрытие модальных окон при клике вне их
    window.onclick = function(event) {
        if (itemModal && event.target === itemModal) {
            itemModal.style.display = 'none';
        }
        if (deleteModal && event.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    };
}

// Функция для загрузки данных из GitHub с использованием токена
async function loadFromGitHub(token) {
    console.log("Загрузка данных из GitHub...");
    
    try {
        const { username, repo, path } = githubConfig;
        
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

// Функция для сохранения данных в GitHub с использованием токена
async function saveToGitHub(data, token) {
    console.log("Сохранение данных в GitHub...");
    
    try {
        const { username, repo, path } = githubConfig;
        
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

// Функция для экспорта данных в JSON файл (локальное скачивание)
function exportToJsonFile() {
    console.log("Экспорт данных в JSON файл...");
    
    try {
        // Проверяем, есть ли данные для экспорта
        if (!items || items.length === 0) {
            showNotification("Нет данных для экспорта", "warning");
            return;
        }
        
        // Создаем содержимое файла
        const jsonContent = JSON.stringify(items, null, 2);
        
        // Создаем Blob и ссылку для скачивания
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Создаем временную ссылку для скачивания
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'gallery_data.json';
        
        // Добавляем ссылку на страницу, кликаем по ней и удаляем
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Освобождаем URL
        URL.revokeObjectURL(url);
        
        showNotification("Данные экспортированы в файл", "success");
    } catch (error) {
        console.error("Ошибка при экспорте данных:", error);
        showNotification("Ошибка при экспорте данных", "error");
    }
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

// Функция для отображения индикатора загрузки
function showLoadingIndicator(message) {
    console.log("Показ индикатора загрузки:", message);
    
    let loadingIndicator = document.getElementById('loadingIndicator');
    
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loadingIndicator';
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.style.position = 'fixed';
        loadingIndicator.style.top = '0';
        loadingIndicator.style.left = '0';
        loadingIndicator.style.width = '100%';
        loadingIndicator.style.backgroundColor = '#2196F3';
        loadingIndicator.style.color = 'white';
        loadingIndicator.style.padding = '10px';
        loadingIndicator.style.textAlign = 'center';
        loadingIndicator.style.zIndex = '9999';
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
