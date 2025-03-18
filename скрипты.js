// Массив для хранения элементов
let items = [];
let currentFilter = 'all';
let isSorted = false;

// GitHub API конфигурация без токена
const githubConfig = {
    username: 'Relben00',
    repo: 'Site',
    path: 'danns.json'
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

function checkGitHubToken() {
    const token = localStorage.getItem('githubToken');
    
    // Находим элемент статуса
    let tokenStatus = document.getElementById('tokenStatus');
    
    if (!tokenStatus) {
        console.error("Элемент статуса GitHub не найден");
        return !!token;
    }
    
    // Обновляем статус
    if (token) {
        tokenStatus.textContent = 'GitHub: Подключен';
        tokenStatus.className = 'ms-2 badge bg-success';
    } else {
        tokenStatus.textContent = 'GitHub: Не подключен';
        tokenStatus.className = 'ms-2 badge bg-danger';
    }
    
    // При клике на статус показываем форму для ввода токена
    tokenStatus.onclick = function() {
        showTokenInputForm();
    };
    
    return !!token;
}

// Функция для отображения формы ввода токена
function showTokenInputForm() {
    // Удаляем существующее модальное окно, если оно есть
    let existingModal = document.getElementById('tokenModal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // Создаем модальное окно для Bootstrap
    const tokenModalHTML = `
    <div class="modal fade" id="tokenModal" tabindex="-1" aria-labelledby="tokenModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="tokenModalLabel">Настройка GitHub токена</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Введите ваш персональный токен GitHub для работы с репозиторием. 
                    Токен будет сохранен только в вашем браузере и не будет отправлен на сервер.</p>
                    
                    <div class="mb-3">
                        <input type="password" class="form-control" id="githubTokenInput" 
                        placeholder="Введите GitHub токен" value="${localStorage.getItem('githubToken') || ''}">
                    </div>
                    
                    <p class="text-muted small">Для создания токена перейдите в 
                    <a href="https://github.com/settings/tokens" target="_blank">настройки GitHub</a> 
                    и выберите "Generate new token". Выберите разрешение "repo".</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                    <button type="button" class="btn btn-danger" id="clearTokenBtn">Удалить токен</button>
                    <button type="button" class="btn btn-success" id="saveTokenBtn">Сохранить</button>
                </div>
            </div>
        </div>
    </div>`;
    
    // Добавляем модальное окно в body
    document.body.insertAdjacentHTML('beforeend', tokenModalHTML);
    
    // Получаем элемент модального окна
    const tokenModalEl = document.getElementById('tokenModal');
    
    // Инициализируем модальное окно Bootstrap
    const tokenModal = new bootstrap.Modal(tokenModalEl);
    
    // Показываем модальное окно
    tokenModal.show();
    
    // Добавляем обработчики событий
    document.getElementById('clearTokenBtn').onclick = function() {
        localStorage.removeItem('githubToken');
        tokenModal.hide();
        updateTokenStatus(false);
        showNotification("GitHub токен удален", "info");
    };
    
    document.getElementById('saveTokenBtn').onclick = function() {
        const tokenInput = document.getElementById('githubTokenInput');
        const token = tokenInput.value.trim();
        
        if (token) {
            // Показываем индикатор загрузки
            showLoadingIndicator("Проверка токена...");
            
            // Проверяем токен
            testGitHubToken(token).then(valid => {
                hideLoadingIndicator();
                
                if (valid) {
                    localStorage.setItem('githubToken', token);
                    tokenModal.hide();
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
    
    // Обработка нажатия Enter
    document.getElementById('githubTokenInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('saveTokenBtn').click();
        }
    });
}

// Функция для обновления статуса токена
function updateTokenStatus(isConnected) {
    const tokenStatus = document.getElementById('tokenStatus');
    if (tokenStatus) {
        if (isConnected) {
            tokenStatus.textContent = 'GitHub: Подключен';
            tokenStatus.className = 'ms-2 badge bg-success';
        } else {
            tokenStatus.textContent = 'GitHub: Не подключен';
            tokenStatus.className = 'ms-2 badge bg-danger';
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
            
            // Показываем модальное окно через Bootstrap API
            const itemModal = new bootstrap.Modal(document.getElementById('itemModal'));
            itemModal.show();
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
                sortButton.classList.remove('btn-primary');
                sortButton.classList.add('btn-warning');
            } else {
                sortButton.textContent = 'Сортировка';
                sortButton.classList.remove('btn-warning');
                sortButton.classList.add('btn-primary');
            }
            
            renderGallery();
        };
    } else {
        console.error("Кнопка сортировки не найдена");
    }
    
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
    
    // Кнопка фильтра и его опции
const filterButton = document.getElementById('filterButton');
const filterOptions = document.getElementById('filterOptions');

if (filterButton && filterOptions) {
    // Показать/скрыть выпадающее меню при клике на кнопку
    filterButton.addEventListener('click', function(e) {
        e.stopPropagation();
        filterOptions.classList.toggle('d-none');
    });
    
    // Закрыть меню при клике вне
    document.addEventListener('click', function(event) {
        if (!filterButton.contains(event.target) && !filterOptions.contains(event.target)) {
            filterOptions.classList.add('d-none');
        }
    });
    
    // Обработчики для опций фильтра
    document.querySelectorAll('#filterOptions .list-group-item').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Установить текущий фильтр
            currentFilter = this.dataset.filter;
            console.log("Выбран фильтр:", currentFilter);
            
            // Обновить активный элемент
            document.querySelectorAll('#filterOptions .list-group-item').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
            
            // Обновить текст кнопки
            filterButton.innerHTML = `<i class="fas fa-filter"></i> ${this.textContent}`;
            
            // Скрыть меню
            filterOptions.classList.add('d-none');
            
            // Обновить галерею
            renderGallery();
        });
    });
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
                showNotification('Пожалуйста, заполните все обязательные поля', 'error');
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
            const modalEl = document.getElementById('itemModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            
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
    
    // Кнопки отмены модальных окон
    document.getElementById('cancelItem')?.addEventListener('click', function() {
        const modalEl = document.getElementById('itemModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    });
    
    document.getElementById('cancelDelete')?.addEventListener('click', function() {
        const modalEl = document.getElementById('deleteModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    });
    
    // Кнопка подтверждения удаления
    const confirmDelete = document.getElementById('confirmDelete');
    if (confirmDelete) {
        confirmDelete.onclick = function() {
            console.log("Подтверждение удаления");
            
            const id = document.getElementById('deleteItemId').value;
            if (!id) return;
            
            // Удаляем элемент из массива
            items = items.filter(item => item.id !== id);
            
            // Сохраняем обновленный массив
            localStorage.setItem('galleryItems', JSON.stringify(items));
            
            // Закрываем модальное окно
            const modalEl = document.getElementById('deleteModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            
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

// Функция для отображения галереи
function renderGallery() {
    console.log("Отображение галереи...");
    
    // Массив для хранения элементов
let items = [];
let currentFilter = 'all';
let currentCategory = 'all'; // Добавляем переменную для текущей категории
let isSorted = false;

// Массив доступных категорий
const availableCategories = ['OF', 'Ph', 'Азиатки'];

// GitHub API конфигурация без токена
const githubConfig = {
    username: 'Relben00',
    repo: 'Site',
    path: 'danns.json'
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
    
    // Инициализация категорий
    initCategoryFilters();
});

// Инициализация фильтров по категориям
function initCategoryFilters() {
    const categoryLinks = document.querySelectorAll('#categoryList a');
    
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Устанавливаем текущую категорию
            currentCategory = this.getAttribute('data-category');
            
            // Обновляем активный элемент
            categoryLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Обновляем галерею
            renderGallery();
        });
    });
}

function checkGitHubToken() {
    const token = localStorage.getItem('githubToken');
    
    // Находим элемент статуса
    let tokenStatus = document.getElementById('tokenStatus');
    
    if (!tokenStatus) {
        console.error("Элемент статуса GitHub не найден");
        return !!token;
    }
    
    // Обновляем статус
    if (token) {
        tokenStatus.textContent = 'GitHub: Подключен';
        tokenStatus.className = 'ms-2 badge bg-success';
    } else {
        tokenStatus.textContent = 'GitHub: Не подключен';
        tokenStatus.className = 'ms-2 badge bg-danger';
    }
    
    // При клике на статус показываем форму для ввода токена
    tokenStatus.onclick = function() {
        showTokenInputForm();
    };
    
    return !!token;
}

// Функция для отображения формы ввода токена
function showTokenInputForm() {
    // Удаляем существующее модальное окно, если оно есть
    let existingModal = document.getElementById('tokenModal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // Создаем модальное окно для Bootstrap
    const tokenModalHTML = `
    <div class="modal fade" id="tokenModal" tabindex="-1" aria-labelledby="tokenModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="tokenModalLabel">Настройка GitHub токена</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Введите ваш персональный токен GitHub для работы с репозиторием. 
                    Токен будет сохранен только в вашем браузере и не будет отправлен на сервер.</p>
                    
                    <div class="mb-3">
                        <input type="password" class="form-control" id="githubTokenInput" 
                        placeholder="Введите GitHub токен" value="${localStorage.getItem('githubToken') || ''}">
                    </div>
                    
                    <p class="text-muted small">Для создания токена перейдите в 
                    <a href="https://github.com/settings/tokens" target="_blank">настройки GitHub</a> 
                    и выберите "Generate new token". Выберите разрешение "repo".</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
                    <button type="button" class="btn btn-danger" id="clearTokenBtn">Удалить токен</button>
                    <button type="button" class="btn btn-success" id="saveTokenBtn">Сохранить</button>
                </div>
            </div>
        </div>
    </div>`;
    
    // Добавляем модальное окно в body
    document.body.insertAdjacentHTML('beforeend', tokenModalHTML);
    
    // Получаем элемент модального окна
    const tokenModalEl = document.getElementById('tokenModal');
    
    // Инициализируем модальное окно Bootstrap
    const tokenModal = new bootstrap.Modal(tokenModalEl);
    
    // Показываем модальное окно
    tokenModal.show();
    
    // Добавляем обработчики событий
    document.getElementById('clearTokenBtn').onclick = function() {
        localStorage.removeItem('githubToken');
        tokenModal.hide();
        updateTokenStatus(false);
        showNotification("GitHub токен удален", "info");
    };
    
    document.getElementById('saveTokenBtn').onclick = function() {
        const tokenInput = document.getElementById('githubTokenInput');
        const token = tokenInput.value.trim();
        
        if (token) {
            // Показываем индикатор загрузки
            showLoadingIndicator("Проверка токена...");
            
            // Проверяем токен
            testGitHubToken(token).then(valid => {
                hideLoadingIndicator();
                
                if (valid) {
                    localStorage.setItem('githubToken', token);
                    tokenModal.hide();
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
    
    // Обработка нажатия Enter
    document.getElementById('githubTokenInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('saveTokenBtn').click();
        }
    });
}

// Функция для обновления статуса токена
function updateTokenStatus(isConnected) {
    const tokenStatus = document.getElementById('tokenStatus');
    if (tokenStatus) {
        if (isConnected) {
            tokenStatus.textContent = 'GitHub: Подключен';
            tokenStatus.className = 'ms-2 badge bg-success';
        } else {
            tokenStatus.textContent = 'GitHub: Не подключен';
            tokenStatus.className = 'ms-2 badge bg-danger';
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
            
            // Подготавливаем категории
            populateCategoriesContainer([]);
            
            // Меняем заголовок
            document.getElementById('modalTitle').textContent = 'Добавить новый элемент';
            
            // Показываем модальное окно через Bootstrap API
            const itemModal = new bootstrap.Modal(document.getElementById('itemModal'));
            itemModal.show();
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
                sortButton.classList.remove('btn-primary');
                sortButton.classList.add('btn-warning');
            } else {
                sortButton.textContent = 'Сортировка';
                sortButton.classList.remove('btn-warning');
                sortButton.classList.add('btn-primary');
            }
            
            renderGallery();
        };
    } else {
        console.error("Кнопка сортировки не найдена");
    }
    
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
    
    // Кнопка фильтра и его опции
    const filterButton = document.getElementById('filterButton');
    const filterOptions = document.getElementById('filterOptions');

    if (filterButton && filterOptions) {
        // Показать/скрыть выпадающее меню при клике на кнопку
        filterButton.addEventListener('click', function(e) {
            e.stopPropagation();
            filterOptions.classList.toggle('d-none');
        });
        
        // Закрыть меню при клике вне
        document.addEventListener('click', function(event) {
            if (!filterButton.contains(event.target) && !filterOptions.contains(event.target)) {
                filterOptions.classList.add('d-none');
            }
        });
        
        // Обработчики для опций фильтра
        document.querySelectorAll('#filterOptions .list-group-item').forEach(option => {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Установить текущий фильтр
                currentFilter = this.dataset.filter;
                console.log("Выбран фильтр:", currentFilter);
                
                // Обновить активный элемент
                document.querySelectorAll('#filterOptions .list-group-item').forEach(opt => {
                    opt.classList.remove('active');
                });
                this.classList.add('active');
                
                // Обновить текст кнопки
                filterButton.innerHTML = `<i class="fas fa-filter"></i> ${this.textContent}`;
                
                // Скрыть меню
                filterOptions.classList.add('d-none');
                
                // Обновить галерею
                renderGallery();
            });
        });
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
                showNotification('Пожалуйста, заполните все обязательные поля', 'error');
                return;
            }
            
            // Собираем выбранные категории
            const categories = [];
            document.querySelectorAll('.category-checkbox:checked').forEach(checkbox => {
                categories.push(checkbox.value);
            });
            
            // Создаем новый элемент или обновляем существующий
            const newId = id || Date.now().toString();
            const itemData = { 
                id: newId, 
                title, 
                imageUrl, 
                content,
                categories: categories // Добавляем категории к элементу
            };
            
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
            const modalEl = document.getElementById('itemModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            
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
    
    // Кнопки отмены модальных окон
    document.getElementById('cancelItem')?.addEventListener('click', function() {
        const modalEl = document.getElementById('itemModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    });
    
    document.getElementById('cancelDelete')?.addEventListener('click', function() {
        const modalEl = document.getElementById('deleteModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    });
    
    // Кнопка подтверждения удаления
    const confirmDelete = document.getElementById('confirmDelete');
    if (confirmDelete) {
        confirmDelete.onclick = function() {
            console.log("Подтверждение удаления");
            
            const id = document.getElementById('deleteItemId').value;
            if (!id) return;
            
            // Удаляем элемент из массива
            items = items.filter(item => item.id !== id);
            
            // Сохраняем обновленный массив
            localStorage.setItem('galleryItems', JSON.stringify(items));
            
            // Закрываем модальное окно
            const modalEl = document.getElementById('deleteModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            
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
}

// Функция для заполнения контейнера категорий
function populateCategoriesContainer(selectedCategories = []) {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    availableCategories.forEach(category => {
        const isChecked = selectedCategories.includes(category);
        
        const div = document.createElement('div');
        div.className = 'd-inline-block me-3 mb-2';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.className = 'category-checkbox';
        input.id = `category-${category}`;
        input.value = category;
        input.checked = isChecked;
        
        const label = document.createElement('label');
        label.className = 'category-label';
        label.setAttribute('for', `category-${category}`);
        label.textContent = category;
        
        div.appendChild(input);
        div.appendChild(label);
        container.appendChild(div);
    });
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
    
    // Если нет элементов
    if (!items || items.length === 0) {
        gallery.innerHTML = '<div class="col-12 text-center p-5 bg-white rounded shadow-sm">Нет элементов для отображения</div>';
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
    
    // Фильтрация по категории
    if (currentCategory !== 'all') {
        displayItems = displayItems.filter(item => 
            item.categories && 
            item.categories.includes(currentCategory)
        );
    }
    
    // Применяем сортировку
    if (isSorted) {
        displayItems = sortItems(displayItems);
    }
    
    // Если нет элементов после фильтрации
    if (displayItems.length === 0) {
        gallery.innerHTML = '<div class="col-12 text-center p-5 bg-white rounded shadow-sm">Нет элементов для отображения</div>';
        return;
    }
    
    // Отображаем элементы
    displayItems.forEach(item => {
        const colDiv = document.createElement('div');
        colDiv.className = 'col';
        
        const itemElement = document.createElement('div');
        itemElement.className = 'card h-100 position-relative';
        itemElement.dataset.id = item.id;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'position-absolute top-0 end-0 p-2 d-flex gap-2 item-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-primary btn-sm rounded-circle';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Редактировать';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger btn-sm rounded-circle';
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteBtn.title = 'Удалить';
        
        const itemImg = document.createElement('img');
        itemImg.className = 'card-img-top item-image';
        itemImg.src = item.imageUrl;
        itemImg.alt = item.title;
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        const itemTitle = document.createElement('h5');
        itemTitle.className = 'card-title';
        itemTitle.textContent = item.title;
        
        const itemContent = document.createElement('p');
        itemContent.className = 'card-text item-content';
        itemContent.textContent = item.content || '';
        
        // Добавляем категории, если они есть
        if (item.categories && item.categories.length > 0) {
            const categoriesDiv = document.createElement('div');
            categoriesDiv.className = 'item-categories';
            
            item.categories.forEach(category => {
                const categorySpan = document.createElement('span');
                categorySpan.className = 'item-category';
                categorySpan.textContent = category;
                categoriesDiv.appendChild(categorySpan);
            });
            
            cardBody.appendChild(categoriesDiv);
        }
        
        // Добавляем обработчики событий
        editBtn.onclick = function(e) {
            e.stopPropagation();
            editItem(item.id);
        };
        
        deleteBtn.onclick = function(e) {
            e.stopPropagation();
            showDeleteConfirmation(item.id);
        };
        
        itemImg.onclick = function() {
            openItemPage(item.id);
        };
        
        itemTitle.onclick = function() {
            openItemPage(item.id);
        };
        
        // Добавляем все элементы в контейнер
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        cardBody.appendChild(itemTitle);
        cardBody.appendChild(itemContent);
        
        itemElement.appendChild(actionsDiv);
        itemElement.appendChild(itemImg);
        itemElement.appendChild(cardBody);
        
        colDiv.appendChild(itemElement);
        gallery.appendChild(colDiv);
    });
    
    console.log("Галерея обновлена, элементов:", displayItems.length);
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
    
    // Подготавливаем категории
    populateCategoriesContainer(item.categories || []);
    
    // Меняем заголовок
    document.getElementById('modalTitle').textContent = 'Редактировать элемент';
    
    // Показываем модальное окно
    const itemModal = new bootstrap.Modal(document.getElementById('itemModal'));
    itemModal.show();
}

// Функция для отображения подтверждения удаления
function showDeleteConfirmation(id) {
    console.log("Подтверждение удаления для ID:", id);
    
    document.getElementById('deleteItemId').value = id;
    
    // Показываем модальное окно подтверждения
    const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    deleteModal.show();
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
        loadingIndicator.className = 'position-fixed top-0 start-0 w-100 bg-primary text-white text-center py-3';
        loadingIndicator.style.zIndex = '9999';
        document.body.appendChild(loadingIndicator);
    }
    
    loadingIndicator.innerHTML = `<i class="fas fa-circle-notch fa-spin me-2"></i> ${message || 'Загрузка...'}`;
    loadingIndicator.classList.remove('d-none');
}

// Функция для скрытия индикатора загрузки
function hideLoadingIndicator() {
    console.log("Скрытие индикатора загрузки");
    
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.classList.add('d-none');
    }
}

// Функция для отображения уведомления
function showNotification(message, type = 'info') {
    console.log("Показ уведомления:", message, type);
    
    // Преобразуем тип error в danger (для соответствия Bootstrap)
    const bsType = type === 'error' ? 'danger' : type;
    
    // Проверяем/создаем контейнер для уведомлений
    let notificationsContainer = document.getElementById('notifications');
    if (!notificationsContainer) {
        notificationsContainer = document.createElement('div');
        notificationsContainer.id = 'notifications';
        notificationsContainer.className = 'position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(notificationsContainer);
    }
    
    // Создаем элемент toast
    const toastId = 'toast-' + Date.now();
    const toastEl = document.createElement('div');
    toastEl.id = toastId;
    toastEl.className = `toast align-items-center text-white bg-${bsType} border-0`;
    toastEl.role = 'alert';
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    // Добавляем содержимое toast
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Добавляем toast в контейнер
    notificationsContainer.appendChild(toastEl);
    
    // Инициализируем toast через Bootstrap API
    const toastInstance = new bootstrap.Toast(toastEl, {
        autohide: true,
        delay: 3000
    });
    
    // Показываем toast
    toastInstance.show();
    
    // Удаляем элемент после скрытия
    toastEl.addEventListener('hidden.bs.toast', function() {
        if (toastEl.parentNode) {
            toastEl.parentNode.removeChild(toastEl);
        }
    });
}
