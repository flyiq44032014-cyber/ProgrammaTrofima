
// Без /api — на Vercel префикс /api зарезервирован под serverless-файлы в папке api/
const API_BASE = '/photos';
const form = document.getElementById('photoForm');
const list = document.getElementById('photoList');

async function loadPhotos() {
    const res = await fetch(API_BASE);
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
        list.innerHTML = '<li>Не удалось загрузить список (ожидался JSON).</li>';
        return;
    }
    const photos = await res.json();
    list.innerHTML = photos.map(photo => `
        <li>
            <img src="${photo.filepath}" width="100" height="100" style="cursor:pointer;" onclick="openModal('${photo.filepath}')">
            ${photo.title}
            <button onclick="editPhoto('${photo.id}', '${photo.title}')">Изменить</button>
            <button onclick="deletePhoto('${photo.id}')">Удалить</button>
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
            body: formData
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
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    loadPhotos();
}

function editPhoto(id, currentTitle) {
    const newTitle = prompt('Новое название:', currentTitle);
    if (newTitle) {
        fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle })
        }).then(loadPhotos);
    }
}

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