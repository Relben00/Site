let items = [];
let currentCategory = 'all';
let isSorted = false;

document.addEventListener('DOMContentLoaded', async () => {

    // загрузка
    const stored = localStorage.getItem('galleryItems');

    if (stored) {
        items = JSON.parse(stored);
    } else {
        const response = await fetch('danns.json');
        items = await response.json();
        localStorage.setItem('galleryItems', JSON.stringify(items));
    }

    initEvents();
    renderGallery();
});

function initEvents() {

    // поиск
    document.getElementById('searchBox')
        ?.addEventListener('input', renderGallery);

    // сортировка
    document.getElementById('sortButton')
        ?.addEventListener('click', () => {
            isSorted = !isSorted;
            renderGallery();
        });

    // категории
    document.querySelectorAll('#categoryList a')
        .forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();

                document.querySelectorAll('#categoryList a')
                    .forEach(l => l.classList.remove('active'));

                link.classList.add('active');
                currentCategory = link.dataset.category;

                renderGallery();
            });
        });

    // добавить
    document.getElementById('addButton')
        ?.addEventListener('click', addItem);
}

/* ---------------- ДОБАВЛЕНИЕ ---------------- */

function addItem() {

    const title = prompt("Название:");
    if (!title) return;

    const imageUrl = prompt("URL картинки:");
    if (!imageUrl) return;

    const categories = prompt("Категории через запятую (OF, Ph, Азиатки):");

    const newItem = {
        id: Date.now().toString(),
        title,
        imageUrl,
        content: "",
        categories: categories
            ? categories.split(',').map(c => c.trim())
            : []
    };

    items.push(newItem);
    save();
    renderGallery();
}

/* ---------------- ОТОБРАЖЕНИЕ ---------------- */

function renderGallery() {

    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';

    let filtered = [...items];

    // поиск
    const search = document.getElementById('searchBox')
        ?.value.toLowerCase().trim();

    if (search) {
        filtered = filtered.filter(item =>
            item.title.toLowerCase().includes(search)
        );
    }

    // категория
    if (currentCategory !== 'all') {
        filtered = filtered.filter(item =>
            item.categories?.includes(currentCategory)
        );
    }

    // сортировка
    if (isSorted) {
        filtered.sort((a, b) =>
            a.title.localeCompare(b.title)
        );
    }

    if (filtered.length === 0) {
        gallery.innerHTML =
            '<div class="col-12 text-center p-5 bg-white rounded">Нет элементов</div>';
        return;
    }

    filtered.forEach(item => {

        const col = document.createElement('div');
        col.className = 'col';

        col.innerHTML = `
            <div class="card h-100">
                <img src="${item.imageUrl}" class="card-img-top">
                <div class="card-body">
                    <h5>${item.title}</h5>
                    <small class="text-muted">
                        ${item.categories?.join(', ') || ''}
                    </small>
                </div>
            </div>
        `;

        gallery.appendChild(col);
    });
}

/* ---------------- СОХРАНЕНИЕ ---------------- */

function save() {
    localStorage.setItem('galleryItems', JSON.stringify(items));
}