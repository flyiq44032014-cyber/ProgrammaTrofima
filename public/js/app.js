
const API_BASE = '/api/photos';
const form = document.getElementById('photoForm');
const list = document.getElementById('photoList');

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function loadPhotos() {
    const res = await fetch(API_BASE, { cache: 'no-store' });
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
        list.innerHTML = '<li>Не удалось загрузить список (ожидался JSON).</li>';
        return;
    }
    const photos = await res.json();
    list.innerHTML = photos.map(photo => `
        <li>
            <img src="${escapeHtml(photo.filepath)}" width="100" height="100" style="cursor:pointer;" class="photo-thumb" data-modal-src="${escapeHtml(photo.filepath)}">
            ${escapeHtml(photo.title)}
            <button type="button" class="btn-edit" data-photo-id="${escapeHtml(photo.id)}" data-photo-title="${escapeHtml(photo.title)}">Изменить</button>
            <button type="button" class="btn-delete" data-photo-id="${escapeHtml(photo.id)}">Удалить</button>
        </li>
    `).join('');
}

async function createPhoto(e) {
    e.preventDefault();

    const titleInput = document.getElementById('title');
    const photoInput = document.getElementById('photo');

    const title = titleInput.value;
    const photoFile = photoInput.files[0];

    if (!photoFile) {
        alert('Выбери фото!');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('photo', photoFile);

    try {
        const res = await fetch(API_BASE, {
            method: 'POST',
            body: formData,
            cache: 'no-store'
        });

        if (res.ok) {
            form.reset();
            loadPhotos();
        } else {
            let msg = 'Ошибка загрузки';
            try {
                const data = await res.json();
                if (data && (data.details || data.error)) {
                    msg = [data.error, data.details].filter(Boolean).join(': ');
                }
            } catch {
                // ignore
            }
            alert(msg);
        }
    } catch (err) {
        alert('Ошибка сети');
    }
}

async function deletePhoto(id) {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, { method: 'DELETE', cache: 'no-store' });
    if (!res.ok) {
        let msg = 'Не удалось удалить';
        try {
            const data = await res.json();
            if (data && data.error) msg = data.error;
        } catch {
            /* empty body */
        }
        alert(msg);
        return;
    }
    loadPhotos();
}

async function editPhoto(id, currentTitle) {
    const newTitle = prompt('Новое название:', currentTitle);
    if (newTitle == null || newTitle === '') return;
    const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
        cache: 'no-store'
    });
    if (!res.ok) {
        let msg = 'Не удалось сохранить';
        try {
            const data = await res.json();
            if (data && data.error) msg = data.error;
        } catch {
            /* empty body */
        }
        alert(msg);
        return;
    }
    loadPhotos();
}

list.addEventListener('click', e => {
    const thumb = e.target.closest('.photo-thumb');
    if (thumb && thumb.dataset.modalSrc) {
        openModal(thumb.dataset.modalSrc);
        return;
    }
    const editBtn = e.target.closest('.btn-edit');
    if (editBtn && editBtn.dataset.photoId != null) {
        editPhoto(editBtn.dataset.photoId, editBtn.dataset.photoTitle ?? '');
        return;
    }
    const delBtn = e.target.closest('.btn-delete');
    if (delBtn && delBtn.dataset.photoId != null) {
        deletePhoto(delBtn.dataset.photoId);
    }
});

// Модалка для просмотра фото
let modal = document.getElementById('modal');
let modalImg = document.getElementById('modalImg');

if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal';
    modal.style.cssText = 'display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);z-index:999;';
    modal.innerHTML = '<img id="modalImg" style="display:block;margin:5rem auto;max-width:90%;max-height:90%;"><button onclick="closeModal()" style="position:absolute;top:1rem;right:1rem;color:white;background:red;border:none;padding:10px;cursor:pointer;">×</button>';
    document.body.appendChild(modal);
    modalImg = document.getElementById('modalImg');
}

function openModal(imagePath) {
    modalImg.src = imagePath;
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

modal.onclick = function(e) {
    if (e.target === modal) closeModal();
};

form.addEventListener('submit', createPhoto);
loadPhotos();