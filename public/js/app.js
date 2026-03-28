
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
        list.innerHTML = '<li class="list-error">Не удалось загрузить список (ожидался JSON).</li>';
        return;
    }
    const photos = await res.json();
    list.innerHTML = photos.map(photo => `
        <li class="photo-card">
            <img src="${escapeHtml(photo.filepath)}" alt="" width="88" height="88" class="photo-thumb" data-modal-src="${escapeHtml(photo.filepath)}">
            <div class="photo-meta">
                <span class="photo-title">${escapeHtml(photo.title)}</span>
                <div class="photo-actions">
                    <button type="button" class="btn btn-edit" data-photo-id="${escapeHtml(photo.id)}" data-photo-title="${escapeHtml(photo.title)}">Изменить</button>
                    <button type="button" class="btn btn-delete" data-photo-id="${escapeHtml(photo.id)}">Удалить</button>
                </div>
            </div>
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
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Просмотр фото');
    modal.innerHTML =
        '<img id="modalImg" class="modal__img" alt="Просмотр в полном размере">' +
        '<button type="button" class="modal__close" onclick="closeModal()" aria-label="Закрыть">×</button>';
    document.body.appendChild(modal);
    modalImg = document.getElementById('modalImg');
}

function openModal(imagePath) {
    modalImg.src = imagePath;
    modal.classList.add('is-open');
}

function closeModal() {
    modal.classList.remove('is-open');
}

modal.onclick = function(e) {
    if (e.target === modal) closeModal();
};

form.addEventListener('submit', createPhoto);
loadPhotos();