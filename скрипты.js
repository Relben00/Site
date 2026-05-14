let items = JSON.parse(localStorage.getItem('galleryItems')) || [];

document.addEventListener('DOMContentLoaded', () => {
    renderGallery();

    document.getElementById('addButton')?.addEventListener('click', addItem);
    document.getElementById('sortButton')?.addEventListener('click', sortItems);
    document.getElementById('searchBox')?.addEventListener('input', renderGallery);
});

/* ---------- ДОБАВЛЕНИЕ ---------- */

function addItem() {
    const title = prompt("Название:");
    if (!title) return;

    const imageUrl = prompt("URL картинки:");
    if (!imageUrl) return;

    const newItem = {
        id: Date.now().toString(),
        title,
        imageUrl
    };

    items.push(newItem);
    save();
    renderGallery();
}

/* ---------- СОРТИРОВКА ---------- */

function sortItems() {
    items.sort((a, b) => a.title.localeCompare(b.title));
    save();
    renderGallery();
}

/* ---------- ОТОБРАЖЕНИЕ ---------- */

function renderGallery() {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;

    gallery.innerHTML = '';

    let search = document.getElementById('searchBox')?.value.toLowerCase() || '';

    let filtered = items.filter(item =>
        item.title.toLowerCase().includes(search)
    );

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
                    <button class="btn btn-sm btn-danger delete-btn">Удалить</button>
                </div>
            </div>
        `;

        col.querySelector('.delete-btn').addEventListener('click', () => {
            items = items.filter(i => i.id !== item.id);
            save();
            renderGallery();
        });

        gallery.appendChild(col);
    });
}

/* ---------- СОХРАНЕНИЕ ---------- */

function save() {
    localStorage.setItem('galleryItems', JSON.stringify(items));
}
