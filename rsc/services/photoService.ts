import sqlite3 from 'sqlite3';

// ❗ если у тебя интерфейс Photo в другом месте — укажи правильный путь
export interface Photo {
    id: string;
    title: string;
    filename: string;
    filepath: string;
}

const DB_PATH = 'photos.db';

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('🗄️ DB connection error:', err);
    } else {
        console.log('✅ DB connected:', DB_PATH);
    }
});

// Создать таблицу, если нет
db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL
    )`
    );
    console.log('🗄️ Creating table...');
});

// Получить все фото
export const getAllPhotos = (): Promise<Photo[]> => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM photos', (err, rows) => {
            if (err) {
                console.error('🗄️ getAllPhotos error:', err);
                reject(err);
            } else {
                console.log('🗄️ getAllPhotos rows:', rows);
                resolve(rows as Photo[]);
            }
        });
    });
};

// Добавить фото
export const createPhoto = (photo: Omit<Photo, 'id'>): Promise<Photo> => {
    console.log('📁 createPhoto: data =', photo);

    const { title, filename, filepath } = photo;

    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO photos (title, filename, filepath) VALUES (?, ?, ?)`;
        const params = [title, filename, filepath];

        db.run(sql, params, function (err) {
            if (err) {
                console.error('🗄️ createPhoto error:', err);
                reject(err);
            } else {
                console.log(`🗄️ createPhoto success, lastID = ${this.lastID}`);
                const newPhoto: Photo = {
                    id: String(this.lastID),
                    title,
                    filename,
                    filepath
                };
                resolve(newPhoto);
            }
        });
    });
};

// Получить по ID
export const getPhotoById = (id: string): Promise<Photo | null> => {
    console.log('📁 getPhotoById: id =', id);

    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM photos WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error('🗄️ getPhotoById error:', err);
                reject(err);
            } else {
                console.log('📁 getPhotoById row =', row);
                resolve(row ? (row as Photo) : null);
            }
        });
    });
};

// Обновить по ID
export const updatePhoto = (id: string, data: { title: string }): Promise<Photo | null> => {
    console.log('📁 updatePhoto: id =', id, 'data =', data);

    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE photos SET title = ? WHERE id = ?`,
            [data.title, id],
            function (err) {
                if (err) {
                    console.error('🗄️ updatePhoto error:', err);
                    reject(err);
                } else {
                    if (this.changes === 0) {
                        console.log('📁 updatePhoto: no rows updated, id =', id);
                        resolve(null);
                    } else {
                        getPhotoById(id)
                            .then(photo => resolve(photo))
                            .catch(reject);
                    }
                }
            }
        );
    });
};

// Удалить по ID
export const deletePhoto = (id: string): Promise<boolean> => {
    console.log('📁 deletePhoto: id =', id);

    return new Promise((resolve, reject) => {
        db.run('DELETE FROM photos WHERE id = ?', [id], function (err) {
            if (err) {
                console.error('🗄️ deletePhoto error:', err);
                reject(err);
            } else {
                console.log('📁 deletePhoto changes =', this.changes);
                resolve(this.changes > 0);
            }
        });
    });
};