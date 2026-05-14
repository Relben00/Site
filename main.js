let items = [];

document.addEventListener('DOMContentLoaded', async () => {

    // пробуем взять из localStorage
    const stored = localStorage.getItem('galleryItems');

    if (stored) {
        items = JSON.parse(stored);
        renderGallery();
    } else {
        // если нет — загружаем danns.json
        try {
            const response = await fetch('danns.json');
            items = await response.json();
            localStorage.setItem('galleryItems', JSON.stringify(items));
            renderGallery();
        } catch (error) {
            console.error('Ошибка загрузки JSON:', error);
        }
    }

    document.getElementById('searchBox')?.addEventListener('input', renderGallery);
});

/* ---------- ОТОБРАЖЕНИЕ ---------- */

function renderGallery() {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';

    if (!items || items.length === 0) {
        gallery.innerHTML =
            '<div class="col-12 text-center p-5 bg-white rounded">Нет элементов</div>';
        return;
    }

    let search = document.getElementById('searchBox')?.value.toLowerCase() || '';

    let filtered = items.filter(item =>
        item.title.toLowerCase().includes(search)
    );

    filtered.forEach(item => {

        const col = document.createElement('div');
        col.className = 'col';

        col.innerHTML = `
            <div class="card h-100">
                <img src="${item.imageUrl}" class="card-img-top">
                <div class="card-body">
                    <h5>${item.title}</h5>
                </div>
            </div>
        `;

        gallery.appendChild(col);
    });
}