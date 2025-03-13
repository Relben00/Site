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

// Функция для получения элементов DOM после загрузки страницы
function initializeDOM() {
    console.log("Инициализация DOM элементов...");
    
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
    
    // Проверяем наличие элементов
    console.log("Элементы DOM:", {
        addButton: !!addButton,
        sortButton: !!sortButton,
        filterButton: !!filterButton,
        filterOptions: !!filterOptions,
        searchBox: !!searchBox,
        itemModal: !!itemModal,
        deleteModal: !!deleteModal,
        gallery: !!gallery
    });
    
    // Открыть модальное окно при нажатии на кнопку добавления
    if (addButton) {
        addButton.onclick = function() {
            console.log("Нажата кнопка добавления");
            
            // Сбрасываем поля формы
            document.getElementById('itemId').value = '';
            document.getElementById('itemTitle').value = '';
            document.getElementById('itemImage').value = '';
            document.getElementById('itemContent').value = '';

            // Меняем заголовок модального окна
            modalTitle.textContent = 'Добавить новый элемент';

            // Отображаем модальное окно
            itemModal.style.display = 'block';
        };
    }

    // Обработчик кнопки сортировки
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
    }

    // Показать/скрыть опции фильтра
    if (filterButton && filterOptions) {
        filterButton.onclick = function() {
            console.log("Нажата кнопка фильтра");
            
            filterOptions.style.display = filterOptions.style.display === 'block' ? 'none' : 'block';
        };
    }

    // Закрыть опции фильтра при клике вне
    document.onclick = function(event) {
        if (filterOptions && filterOptions.style.display === 'block' && 
            !event.target.closest('.filter-btn') && 
            !event.target.closest('.filter-options')) {
            filterOptions.style.display = 'none';
        }
    };

    // Обработчики для опций фильтра
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

            // Обновляем галерею
            renderGallery();
        };
    });

    // Поиск по названию
    if (searchBox) {
        searchBox.oninput = function() {
            console.log("Поиск:", this.value);
            renderGallery();
        };
    }

    // Закрыть модальные окна
    if (closeModal && itemModal) {
        closeModal.onclick = function() {
            console.log("Закрытие модального окна добавления/редактирования");
            itemModal.style.display = 'none';
        };
    }

    if (closeDeleteModal && deleteModal) {
        closeDeleteModal.onclick = function() {
            console.log("Закрытие модального окна удаления");
            deleteModal.style.display = 'none';
        };
    }

    if (cancelDelete && deleteModal) {
        cancelDelete.onclick = function() {
            console.log("Отмена удаления");
            deleteModal.style.display = 'none';
        };
    }

    // Закрыть модальные окна при клике вне их
    window.onclick = function(event) {
        if (itemModal && event.target === itemModal) {
            itemModal.style.display = 'none';
        }
        if (deleteModal && event.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    };

    // Обработчик сохранения
    if (saveItem) {
        saveItem.onclick = async function() {
            console.log("Нажата кнопка сохранения");
            
            const id = document.getElementById('itemId').value;
            const title = document.getElementById('itemTitle').value;
            const imageUrl = document.getElementById('itemImage').value;
            const content = document.getElementById('itemContent').value;

            if (title && imageUrl) {
                console.log("Сохранение элемента:", { title, imageUrl });
                
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
        };
    }

    // Обработчик подтверждения удаления
    if (confirmDelete) {
        confirmDelete.onclick = async function() {
            console.log("Подтверждение удаления");
            
            const id = document.getElementById('deleteItemId').value;
            console.log("Удаление элемента с ID:", id);
            
            // Удаляем элемент
            await deleteItemFromJSON(id);
            
            // Закрываем модальное окно
            if (deleteModal) {
                deleteModal.style.display = 'none';
            }
        };
    }
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
            
            // Проверяем, что получен корректный ответ
            if (!fileInfo.content) {
                throw new Error('Получен некорректный ответ от GitHub API');
            }
            
            // Декодируем содержимое из base64
            const content = decodeURIComponent(escape(atob(fileInfo.content)));
            const data = JSON.parse(content);
            
            console.log(`Загружено ${data.length} элементов из GitHub`);
            return data;
        } else if (response.status === 404) {
            console.log("Файл не найден в GitHub, создаем новый список");
            return [];
        } else {
            throw new Error(`Ошибка GitHub API: ${response.status}`);
        }
    } catch (error) {
        console.error("Ошибка при загрузке из GitHub:", error);
        
        // Загружаем из localStorage как резервную копию
        console.log("Пытаемся загрузить из localStorage...");
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
        console.log("Данные в localStorage не найдены, создаем пустой список");
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
            console.log("Получен SHA существующего файла:", sha);
        } else {
            console.log("Файл не существует в GitHub, будет создан новый");
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
            const errorData = await updateResponse.text();
            console.error("Данные ошибки:", errorData);
            throw new Error(`Ошибка GitHub API при сохранении: ${updateResponse.status}`);
        }
    } catch (error) {
        console.error("Ошибка при сохранении в GitHub:", error);
        
        // Сохраняем локально как резервную копию
        localStorage.setItem('galleryItems', JSON.stringify(data));
        console.log("Данные сохранены локально в localStorage");
        
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
        console.log("Элемент обновлен в локальном массиве");
    } else {
        items.push(item);
        console.log("Элемент добавлен в локальный массив");
    }
    
    // Сохраняем в localStorage в любом случае
    localStorage.setItem('galleryItems', JSON.stringify(items));
    console.log("Элементы сохранены в localStorage");
    
    // Сохраняем в GitHub
    try {
        const result = await saveToGitHub(items);
        if (result) {
            console.log("Элементы успешно сохранены в GitHub");
        } else {
            console.log("Элементы сохранены только локально");
        }
        
        // Обновляем галерею
        renderGallery();
        return result;
    } catch (error) {
        console.error("Ошибка при сохранении элемента:", error);
        
        // Обновляем галерею в любом случае
        renderGallery();
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
    const originalLength = items.length;
    items = items.filter(item => item.id !== id);
    
    if (items.length === originalLength) {
        console.log("Элемент с ID", id, "не найден в массиве");
    } else {
        console.log("Элемент удален из локального массива");
    }
    
    // Сохраняем обновленный массив в localStorage
    localStorage.setItem('galleryItems', JSON.stringify(items));
    console.log("Обновленные элементы сохранены в localStorage");
    
    // Сохраняем в GitHub
    try {
        const result = await saveToGitHub(items);
        if (result) {
            console.log("Элементы успешно сохранены в GitHub после удаления");
        } else {
            console.log("Элементы сохранены только локально после удаления");
        }
        
        // Обновляем галерею
        renderGallery();
        return result;
    } catch (error) {
        console.error("Ошибка при удалении элемента:", error);
        
        // Обновляем галерею в любом случае
        renderGallery();
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
    } else {
        console.error("Элемент с ID", id, "не найден");
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
    } else {
        console.error("Элементы модального окна удаления не найдены");
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
    } else {
        console.error("Элемент с ID", id, "не найден");
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
    
    console.log(`Отображение ${displayItems.length} из ${items.length} элементов`);
    
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
    
    console.log("Галерея обновлена");
}

// Функция для автоматического сохранения данных
function setupAutoSave() {
    console.log("Настройка автоматического сохранения...");
    
    // Сохраняем данные каждые 5 минут
    setInterval(async () => {
        if (items.length > 0) {
            console.log("Автоматическое сохранение...");
            await saveToGitHub(items);
        }
    }, 5 * 60 * 1000); // 5 минут
}

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM загружен, начинаем инициализацию...");
    
    // Инициализируем элементы DOM
    initializeDOM();
    
    // Загружаем данные из GitHub
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
    
    // Настраиваем автоматическое сохранение
    setupAutoSave();
    
    console.log("Инициализация завершена");
});
