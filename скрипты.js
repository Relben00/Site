// скрипты.js
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

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    // Загружаем данные из JSON или localStorage
    await loadDataFromJSON();
    renderGallery();
});

// Функция для сохранения данных в JSON
function saveDataToJSON(data) {
  const jsonData = JSON.stringify(data, null, 2);
  
  // Используем localStorage для временного хранения
  localStorage.setItem('galleryItems', jsonData);
  
 // Здесь можно добавить код для сохранения в файл на GitHub
  // Например, через GitHub API (потребуется дополнительная настройка)
  console.log('Данные сохранены:', jsonData);
  return jsonData;
}

// Функция для загрузки данных из JSON
async function loadDataFromJSON() {
  try {
    // Пробуем загрузить данные из JSON файла
    const response = await fetch('danns.json');
    const data = await response.json();
    
    // Используем загруженные данные
    items = data;
    console.log('Данные загружены из JSON:', data);
    
    // Сохраняем копию в localStorage
    localStorage.setItem('galleryItems', JSON.stringify(items));
  } catch (error) {
    console.error('Ошибка при загрузке данных из JSON:', error);
    
     // Если не удалось загрузить из JSON, используем localStorage
    const storedItems = localStorage.getItem('galleryItems');
    if (storedItems) {
      items = JSON.parse(storedItems);
      console.log('Данные загружены из localStorage:', items);
    }
  }
  
  // Отображаем данные
  displayData(items);
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
        // Обновляем локальный массив items
        const index = items.findIndex(i => i.id === item.id);
        if (index !== -1) {
            items[index] = item;
        } else {
            items.push(item);
        }
        
 // Сохраняем в localStorage
        localStorage.setItem('galleryItems', JSON.stringify(items));
        
        // Сохраняем в JSON файл (через GitHub API или другой метод)
        // Здесь нужно будет добавить код для сохранения на GitHub
        saveDataToJSON(items);
        console.log('Данные успешно сохранены');
    } catch (error) {
        console.error('Ошибка при сохранении данных:', error);
        alert('Не удалось сохранить данные в файл. Данные сохранены локально.');
        localStorage.setItem('galleryItems', JSON.stringify(items));
    }
}
        
   // Функция для удаления элемента из JSON
async function deleteItemFromJSON(id) {
    try {
        // Удаляем элемент из массива
        items = items.filter(item => item.id !== id);
        
        // Сохраняем обновленный массив в localStorage
        localStorage.setItem('galleryItems', JSON.stringify(items));
        
        // Сохраняем в JSON файл (через GitHub API или другой метод)
        saveDataToJSON(items);
        
        console.log('Элемент успешно удален');
    } catch (error) {
        console.error('Ошибка при удалении данных:', error);
        alert('Не удалось удалить данные из файла. Данные удалены только локально.');
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
        
        // Сохраняем данные в JSON
        await saveItemToJSON(itemData);
        
        // Обновляем галерею
        renderGallery();
        
        // Закрываем модальное окно
        itemModal.style.display = 'none';
    } else {
        alert('Пожалуйста, заполните все обязательные поля');
    }
});

// Функция для отображения галереи (исправленная)
function renderGallery() {
    gallery.innerHTML = '';
    
    // Применяем фильтрацию
    let displayItems = items;
    
    // Фильтрация по поисковому запросу
    const searchQuery = searchBox.value.toLowerCase().trim();
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
    
    // Сохраняем изменения в JSON
    await deleteItemFromJSON(id);
    
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

// Функция для фильтрации элементов
function filterItems() {
    const searchQuery = searchBox.value.toLowerCase().trim();
    
    // Фильтруем элементы по поисковому запросу и текущему фильтру
    filteredItems = items.filter(item => {
        // Проверяем соответствие поисковому запросу
        const matchesSearch = !searchQuery || 
            item.title.toLowerCase().includes(searchQuery) || 
            (item.content && item.content.toLowerCase().includes(searchQuery));
            
        // Проверяем соответствие фильтру
        let matchesFilter = true;
        if (currentFilter !== 'all') {
            matchesFilter = getCharType(item.title) === currentFilter;
        }
        
        return matchesSearch && matchesFilter;
    });
    
    // Применяем сортировку, если нужно
    if (isSorted) {
        filteredItems = sortItems(filteredItems);
    }
    
    // Обновляем отображение
    renderGallery();
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

// Инициализация автоматического сохранения и загрузки
setupAutoSave();
setupAutoLoad();

// Функция для сохранения данных в GitHub
async function saveToGitHub(data) {
    try {
        // Здесь должен быть код для интеграции с GitHub API
        // Это требует настройки токена доступа и прав на репозиторий
        
        // Пример структуры запроса (не работает без настройки):
        /*
        const response = await fetch('https://api.github.com/repos/USERNAME/REPO/contents/danns.json', {
            method: 'PUT',
            headers: {
                'Authorization': 'token YOUR_GITHUB_TOKEN',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Обновление данных',
                content: btoa(JSON.stringify(data, null, 2)),
                sha: 'current_file_sha_if_exists'
            })
        });
        
        const result = await response.json();
        console.log('Данные сохранены в GitHub:', result);
        */
        
        // Пока просто сохраняем в localStorage
        localStorage.setItem('galleryItems', JSON.stringify(data));
        console.log('Данные сохранены локально (GitHub API не настроен)');
    } catch (error) {
        console.error('Ошибка при сохранении в GitHub:', error);
    }
}

// Проверка работы кнопок при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('Страница загружена, проверяем кнопки:');
    console.log('- Кнопка добавления:', addButton);
    console.log('- Кнопка сортировки:', sortButton);
    console.log('- Кнопка фильтра:', filterButton);
    
    // Проверяем, что обработчики событий прикреплены правильно
    if (addButton) {
        console.log('Обработчик кнопки добавления установлен');
    }
    
    if (sortButton) {
        console.log('Обработчик кнопки сортировки установлен');
    }
    
    if (filterButton) {
        console.log('Обработчик кнопки фильтра установлен');
    }
    
    // Загружаем данные
    loadDataFromJSON();
});

// Добавляем обработчик ошибок для отладки
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Ошибка в JavaScript:', message, 'Строка:', lineno, 'Колонка:', colno, 'Источник:', source, 'Объект ошибки:', error);
    return true;
};
        
