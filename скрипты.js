let items = JSON.parse(localStorage.getItem('galleryItems')) || [];
let currentFilter = 'all';
let currentCategory = 'all';
let isSorted = false;

document.addEventListener('DOMContentLoaded', () => {
    initButtons();
    initCategoryFilters();
    renderGallery();
});

/* ---------------- КАТЕГОРИИ ---------------- */

function initCategoryFilters() {
    document.querySelectorAll('#categoryList a').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();

            document.querySelectorAll('#categoryList a')
                .forEach(l => l.classList.remove('active'));

            link.classList.add('active');
            currentCategory = link.dataset.category || 'all';

            renderGallery();
        });
    });
}

/* ---------------- КНОПКИ ---------------- */

function initButtons() {

    document.getElementById('addButton')?.addEventListener('click', () => {
        const title = prompt("Название:");
        const imageUrl = prompt("URL изображения:");
        if (!title || !imageUrl) return;

        items.push({
            id: Date.now().toString(),
            title,
            imageUrl,
            content: '',
            categories: []
        });

        save();
        renderGallery();
    });

    document.getElementById('sortButton')?.addEventListener('click', () => {
        isSorted = !isSorted;
        renderGallery();
    });

    document.getElementById('searchBox')?.addEventListener('input', renderGallery);
}

/* ---------------- ОТОБРАЖЕНИЕ ---------------- */

function renderGallery() {

    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';

    let displayItems = [...items];

    const searchQuery = document.getElementById('searchBox')?.value
        .toLowerCase()
        .trim();

    if (searchQuery) {
        displayItems = displayItems.filter(item =>
            item.title.toLowerCase().includes(searchQuery)
        );
    }

    if (currentCategory !== 'all') {
        displayItems = displayItems.filter(item =>
            item.categories?.includes(currentCategory)
        );
    }

    if (isSorted) {
        displayItems.sort((a, b) =>
            a.title.localeCompare(b.title)
        );
    }

    if (displayItems.length === 0) {
        gallery.innerHTML =
            '<div class="col-12 text-center p-5 bg-white rounded">Нет элементов</div>';
        return;
    }

    displayItems.forEach(item => {

        const col = document.createElement('div');
        col.className = 'col';

        col.innerHTML = `
            <div class="card h-100">
                <img src="${item.imageUrl}" class="card-img-top">
                <div class="card-body">
                    <h5>${item.title}</h5>
                    <button class="btn btn-sm btn-danger delete-btn">Удалить</button>
                </div>
            </div>
        `;

        col.querySelector('.delete-btn')
            .addEventListener('click', () => {
                items = items.filter(i => i.id !== item.id);
                save();
                renderGallery();
            });

        gallery.appendChild(col);
    });
}

/* ---------------- СОХРАНЕНИЕ ---------------- */

function save() {
    localStorage.setItem('galleryItems', JSON.stringify(items));
}
