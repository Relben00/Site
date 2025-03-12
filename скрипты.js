// скрипты.js
// Массив для хранения элементов
let items = [];
let filteredItems = [];
let currentFilter = 'all';
let isSorted = false;

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
    
    // Проверяем, существуют ли элементы
    console.log('Элементы DOM:', {
        addButton, sortButton, filterButton, filterOptions, searchBox,
        itemModal, deleteModal, closeModal, closeDeleteModal,
        saveItem, cancelDelete, confirmDelete, gallery, modalTitle
    });
    
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
        console.log('Обработчик кнопки добавления установлен');
    } else {
        console.error('Элемент addButton не найден!');
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
        console.log('Обработчик кнопки сортировки установлен');
    } else {
        console.error('Элемент sortButton не найден!');
    }

    // Показать/скрыть опции фильтра
    if (filterButton && filterOptions) {
        filterButton.addEventListener('click', () => {
            filterOptions.style.display = filterOptions.style.display === 'block' ? 'none' : 'block';
        });
        console.log('Обработчик кнопки фильтра установлен');
    } else {
        console.error('Элемент filterButton или filterOptions не найден!');
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
        console.log('Обработчик поиска установлен');
    } else {
        console.error('Элемент searchBox не найден!');
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
                
                // Обновляем локальный массив
                if (id) {
                    const index = items.findIndex(item => item.id === id);
                    if (index !== -1) {
                        items[index] = itemData;
                    }
                } else {
                    items.push(itemData);
                }
                
                // Сохраняем данные в JSON
                await saveItemToJSON(itemData);
                
                // Обновляем галерею
                renderGallery();
                
                // Закрываем модальное окно
                if (itemModal) {
                    itemModal.style.display = 'none';
                }
            } else {
                alert('Пожалуйста, заполните все обязательные поля');
            }
        });
        console.log('Обработчик сохранения установлен');
    } else {
        console.error('Элемент saveItem не найден!');
    }

    // Обработчик подтверждения удаления
    if (confirmDelete) {
        confirmDelete.addEventListener('click', async () => {
            const id = document.getElementById('deleteItemId').value;

            // Удаляем элемент из массива
            items = items.filter(item => item.id !== id);
            
            // Сохраняем изменения в JSON
            await deleteItemFromJSON(id);
            
            // Обновляем localStorage в любом случае
            localStorage.setItem('galleryItems', JSON.stringify(items));

            // Обновляем галерею
            renderGallery();

            // Закрываем модальное окно
            if (deleteModal) {
                deleteModal.style.display = 'none';
            }
        });
        console.log('Обработчик подтверждения удаления установлен');
    } else {
        console.error('Элемент confirmDelete не найден!');
    }
    
    // Возвращаем объекты DOM для использования в других функциях
    return {
        addButton, sortButton, filterButton, filterOptions, searchBox,
        itemModal, deleteModal, closeModal, closeDeleteModal,
        saveItem, cancelDelete, confirmDelete, gallery, modalTitle
    };
}

// Функция для сохранения данных в GitHub
async function saveToGitHub(data) {
    try {
        console.log('Начинаем сохранение данных в GitHub...');
        
        // Конфигурация для GitHub
        const username = 'Relben00'; 
        const repo = 'Site';      
        const path = 'danns.json';                
        const token = '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';
        
        // Проверяем, что токен не пустой
        if (!token || token === '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') {
            throw new Error('GitHub токен не установлен или недействителен');
        }
        
        console.log('Получаем текущий файл для SHA...');
        
        // Сначала получаем текущий файл, чтобы получить его SHA
        const getResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        console.log('Статус ответа при получении файла:', getResponse.status);
        
        let sha = '';
        if (getResponse.status === 200) {
            const fileInfo = await getResponse.json();
            sha = fileInfo.sha;
            console.log('SHA получен:', sha);
        } else if (getResponse.status === 404) {
            console.log('Файл не существует, будет создан новый');
        } else {
            const errorData = await getResponse.text();
            console.error('Ошибка при получении файла:', errorData);
            throw new Error(`Ошибка GitHub API при получении файла: ${getResponse.status}`);
        }
        
        // Подготавливаем данные для сохранения
        const content = JSON.stringify(data, null, 2);
        const encodedContent = btoa(unescape(encodeURIComponent(content)));
        
        console.log('Контент подготовлен для сохранения');
        
        // Обновляем или создаем файл
        console.log('Отправляем запрос на сохранение файла...');
        
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
        
        console.log('Статус ответа при сохранении файла:', updateResponse.status);
        
        if (updateResponse.status === 200 || updateResponse.status === 201) {
            console.log('Данные успешно сохранены в GitHub');
            return true;
        } else {
            const errorData = await updateResponse.text();
            console.error('Ошибка при сохранении файла:', errorData);
            throw new Error(`Ошибка GitHub API при сохранении: ${updateResponse.status}`);
        }
    } catch (error) {
        console.error('Ошибка при сохранении в GitHub:', error);
        
        // Сохраняем локально как резервную копию
        localStorage.setItem('galleryItems', JSON.stringify(data));
        console.log('Данные сохранены локально в localStorage');

        // Выводим более понятное сообщение об ошибке
        const errorMessage = error.message.includes('GitHub токен') 
            ? 'Не удалось сохранить данные в GitHub. Проверьте токен доступа.' 
            : 'Не удалось сохранить данные в GitHub. Данные сохранены локально.';
        
        alert(errorMessage);
        return false;
    }
}
        
// Функция для загрузки данных из GitHub
async function loadFromGitHub() {
    try {
        console.log('Начинаем загрузку данных из GitHub...');
        
        // Конфигурация для GitHub
        const username = 'Relben00';
        const repo = 'Site';
        const path = 'danns.json';
        const token = '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';
        
        // Проверяем, что токен не пустой
        if (!token || token === 'YOUR_TOKEN_HERE') {
            throw new Error('GitHub токен не установлен или недействителен');
        }
        
        // Получаем файл
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        console.log('Статус ответа при загрузке файла:', response.status);
        
        if (response.status === 200) {
            const fileInfo = await response.json();
            
            // Проверяем, что получен корректный ответ
            if (!fileInfo.content) {
                throw new Error('Получен некорректный ответ от GitHub API: отсутствует содержимое файла');
            }
            
            try {
                // Декодируем содержимое из base64
                const content = decodeURIComponent(escape(atob(fileInfo.content)));
                const data = JSON.parse(content);
                
                console.log('Данные успешно загружены из GitHub');
                return data;
            } catch (parseError) {
                console.error('Ошибка при декодировании или разборе JSON:', parseError);
                throw new Error('Не удалось декодировать или разобрать данные из GitHub');
            }
        } else if (response.status === 404) {
            console.log('Файл не найден в репозитории. Будет создан при первом сохранении.');
            return [];
        } else {
            const errorText = await response.text();
            console.error('Ошибка при загрузке файла:', response.status, errorText);
            throw new Error(`Ошибка GitHub API: ${response.status}`);
        }
    } catch (error) {
        console.error('Ошибка при загрузке из GitHub:', error);
        
        // Загружаем из localStorage как резервную копию
        console.log('Пытаемся загрузить данные из localStorage...');
        const storedItems = localStorage.getItem('galleryItems');
        if (storedItems) {
            try {
                const data = JSON.parse(storedItems);
                console.log('Данные успешно загружены из localStorage');
                return data;
            } catch (parseError) {
                console.error('Ошибка при разборе JSON из localStorage:', parseError);
                return [];
            }
        }
        
        console.log('Данные не найдены ни в GitHub, ни в localStorage');
        return [];
    }
}

// Функция для сохранения данных в JSON
async function saveDataToJSON(data) {
    try {
        console.log('Начинаем сохранение данных...');
        
        // Проверяем валидность данных
        if (!Array.isArray(data)) {
            throw new Error('Данные должны быть массивом');
        }
        
        // Сохраняем в localStorage для резервной копии
        localStorage.setItem('galleryItems', JSON.stringify(data));
        console.log('Данные сохранены в localStorage');
      
        // Сохраняем в GitHub
        const githubResult = await saveToGitHub(data);
        
        if (githubResult) {
            console.log('Данные успешно сохранены в GitHub и локально');
            return true;
        } else {
            console.log('Данные сохранены только локально');
            return false;
        }
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error);
        alert('Произошла ошибка при сохранении данных: ' + error.message);
        
        // В любом случае пытаемся сохранить в localStorage
        try {
            localStorage.setItem('galleryItems', JSON.stringify(data));
            console.log('Данные сохранены в localStorage после ошибки');
        } catch (localError) {
            console.error('Не удалось сохранить даже в localStorage:', localError);
        }
        
        return false;
    }
}

// Функция для тестирования соединения с GitHub
async function testGitHubConnection() {
    try {
        const username = 'Relben00';
        const token = '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';
        
        console.log('Тестирование соединения с GitHub...');
        
        const response = await fetch(`https://api.github.com/users/${username}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.status === 200) {
            const userData = await response.json();
            console.log('Соединение с GitHub успешно установлено. Пользователь:', userData.login);
            return true;
        } else {
            const errorText = await response.text();
            console.error('Ошибка при тестировании соединения:', response.status, errorText);
            return false;
        }
    } catch (error) {
        console.error('Ошибка при тестировании соединения с GitHub:', error);
        return false;
    }
}

// Добавляем тестирование соединения при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM полностью загружен');
    
    // Тестируем соединение с GitHub
    const githubConnected = await testGitHubConnection();
    if (githubConnected) {
        console.log('GitHub API доступен');
    } else {
        console.warn('GitHub API недоступен, будет использоваться только локальное хранилище');
        alert('Не удалось подключиться к GitHub. Данные будут сохраняться только локально.');
    }

// Функция для загрузки данных из JSON
async function loadDataFromJSON() {
    try {
        console.log('Начинаем загрузку данных...');
        
        // Загружаем из GitHub
        const data = await loadFromGitHub();
        
        // Проверяем полученные данные
        if (!Array.isArray(data)) {
            console.error('Загруженные данные не являются массивом:', data);
            throw new Error('Загруженные данные имеют неправильный формат');
        }
        
        // Используем загруженные данные
        items = data;
        console.log(`Данные загружены: ${items.length} элементов`);
        
        // Отображаем данные
        displayData(items);
        return true;
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        
        // Если не удалось загрузить, используем localStorage
        try {
            const storedItems = localStorage.getItem('galleryItems');
            if (storedItems) {
                items = JSON.parse(storedItems);
                console.log(`Данные загружены из localStorage: ${items.length} элементов`);
                displayData(items);
                return true;
            } else {
                console.log('Данные в localStorage не найдены');
                items = [];
                displayData(items);
                return false;
            }
        } catch (localError) {
            console.error('Ошибка при загрузке из localStorage:', localError);
            items = [];
            displayData(items);
            return false;
        }
    }
}

// Функция для отображения данных на странице
function displayData(data) {
    // Обновляем массив элементов
    items = data;
    
    // Вызываем функцию отображения галереи
    renderGallery();
}

// Функция для сохранения элемента в JSON
async function saveItemToJSON(item) {
    try {
        console.log('Сохранение элемента:', item);
        
        // Проверяем валидность элемента
        if (!item || !item.id || !item.title || !item.imageUrl) {
            throw new Error('Элемент содержит не все обязательные поля');
        }
        
        // Обновляем локальный массив items
        const index = items.findIndex(i => i.id === item.id);
        if (index !== -1) {
            items[index] = item;
            console.log('Элемент обновлен в массиве');
        } else {
            items.push(item);
            console.log('Элемент добавлен в массив');
        }
        
        // Сохраняем в localStorage в любом случае
        localStorage.setItem('galleryItems', JSON.stringify(items));
        console.log('Массив сохранен в localStorage');
        
        // Сохраняем в JSON файл через GitHub API
        const savedToGitHub = await saveDataToJSON(items);
        
        if (savedToGitHub) {
            console.log('Данные успешно сохранены в GitHub');
        } else {
            console.log('Данные сохранены только локально');
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error);
        alert('Не удалось сохранить элемент. Ошибка: ' + error.message);
        
        // В любом случае пытаемся сохранить в localStorage
        try {
            localStorage.setItem('galleryItems', JSON.stringify(items));
            console.log('Данные сохранены локально после ошибки');
        } catch (localError) {
            console.error('Не удалось сохранить даже в localStorage:', localError);
        }
        
        return false;
    }
}

// Функция для удаления элемента из JSON
async function deleteItemFromJSON(id) {
    try {
        console.log('Удаление элемента с ID:', id);
        
        if (!id) {
            throw new Error('ID элемента не указан');
        }
        
        // Проверяем, существует ли элемент
        const itemExists = items.some(item => item.id === id);
        if (!itemExists) {
            console.warn('Элемент с ID', id, 'не найден в массиве');
        }
        
        // Удаляем элемент из массива
        const originalLength = items.length;
        items = items.filter(item => item.id !== id);
        
        console.log(`Удалено элементов: ${originalLength - items.length}`);
        
        // Сохраняем обновленный массив в localStorage
        localStorage.setItem('galleryItems', JSON.stringify(items));
        console.log('Обновленный массив сохранен в localStorage');
        
        // Сохраняем в JSON файл через GitHub API
        const savedToGitHub = await saveDataToJSON(items);
        
        if (savedToGitHub) {
            console.log('Данные успешно сохранены в GitHub после удаления');
        } else {
            console.log('Данные сохранены только локально после удаления');
        }
        
        return true;
    } catch (error) {
        console.error('Ошибка при удалении данных:', error);
        alert('Не удалось удалить элемент. Ошибка: ' + error.message);
        
        // В любом случае пытаемся сохранить в localStorage
        try {
            localStorage.setItem('galleryItems', JSON.stringify(items));
            console.log('Данные сохранены в localStorage после ошибки удаления');
        } catch (localError) {
            console.error('Не удалось сохранить даже в localStorage после удаления:', localError);
        }
        
        return false;
    }
}

    // Функция для проверки токена GitHub
async function checkGitHubToken() {
    const token = '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';
    
    if (!token || token === 'YOUR_TOKEN_HERE') {
        console.error('GitHub токен не установлен');
        return false;
    }
    
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.status === 200) {
            const userData = await response.json();
            console.log('GitHub токен действителен. Пользователь:', userData.login);
            return true;
        } else {
            console.error('GitHub токен недействителен. Статус:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Ошибка при проверке GitHub токена:', error);
        return false;
    }
}

    // Функция для обновления статуса GitHub в интерфейсе
function updateGitHubStatus(isConnected) {
    // Создаем или находим элемент статуса
    let statusElement = document.getElementById('githubStatus');
    
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.id = 'githubStatus';
        statusElement.style.position = 'fixed';
        statusElement.style.bottom = '10px';
        statusElement.style.right = '10px';
        statusElement.style.padding = '5px 10px';
        statusElement.style.borderRadius = '5px';
        statusElement.style.fontSize = '12px';
        document.body.appendChild(statusElement);
    }
    
    if (isConnected) {
        statusElement.textContent = 'GitHub: Подключен';
        statusElement.style.backgroundColor = '#4CAF50';
        statusElement.style.color = 'white';
    } else {
        statusElement.textContent = 'GitHub: Отключен';
        statusElement.style.backgroundColor = '#f44336';
        statusElement.style.color = 'white';
    }
}

    // Функция для создания резервной копии данных
function createBackup() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupData = JSON.stringify(items);
        localStorage.setItem(`galleryBackup_${timestamp}`, backupData);
        
        // Сохраняем список резервных копий
        const backupsList = JSON.parse(localStorage.getItem('galleryBackupsList') || '[]');
        backupsList.push(timestamp);
        localStorage.setItem('galleryBackupsList', JSON.stringify(backupsList));
        
        console.log(`Создана резервная копия данных: galleryBackup_${timestamp}`);
        return true;
    } catch (error) {
        console.error('Ошибка при создании резервной копии:', error);
        return false;
    }
}

    // Функция для восстановления из резервной копии
function restoreFromBackup(timestamp) {
    try {
        const backupData = localStorage.getItem(`galleryBackup_${timestamp}`);
        if (!backupData) {
            throw new Error(`Резервная копия galleryBackup_${timestamp} не найдена`);
        }
        
        const restoredItems = JSON.parse(backupData);
        items = restoredItems;
        localStorage.setItem('galleryItems', backupData);
        
        console.log(`Данные восстановлены из резервной копии: galleryBackup_${timestamp}`);
        return true;
    } catch (error) {
        console.error('Ошибка при восстановлении из резервной копии:', error);
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
        console.error('Элемент gallery не найден!');
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
    setInterval(() => {
        if (items.length > 0) {
            saveDataToJSON(items);
            console.log('Автоматическое сохранение выполнено');
        }
    }, 5 * 60 * 1000); // 5 минут
}

// Функция для автоматической загрузки данных
function setupAutoLoad() {
    // Загружаем данные каждые 10 минут
    setInterval(() => {
        loadDataFromJSON();
        console.log('Автоматическая загрузка данных выполнена');
    }, 10 * 60 * 1000); // 10 минут
}

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM полностью загружен');
    
    // Проверяем токен GitHub
    const githubConnected = await checkGitHubToken();
    updateGitHubStatus(githubConnected);
    
    // Создаем резервную копию при запуске
    createBackup();
    
    // Инициализируем элементы DOM и прикрепляем обработчики
    const domElements = initializeDOM();
    
    // Проверяем, что все элементы найдены
    if (!domElements.gallery) {
        console.error('Критическая ошибка: элемент gallery не найден!');
        alert('Ошибка: Не удалось найти элемент галереи на странице!');
    }
    
    // Загружаем данные из JSON или localStorage
    const dataLoaded = await loadDataFromJSON();
    
    if (!dataLoaded) {
        console.warn('Не удалось загрузить данные. Используется пустой массив.');
    }
    
    // Отображаем галерею
    renderGallery();
    
    // Инициализация автоматического сохранения и загрузки
    setupAutoSave();
    setupAutoLoad();
    
    console.log('Инициализация приложения завершена');
});

// Добавляем обработчик ошибок для отладки
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Ошибка в JavaScript:', message, 'Строка:', lineno, 'Колонка:', colno, 'Источник:', source, 'Объект ошибки:', error);
    return true;
};
