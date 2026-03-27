import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs/promises';  // ✅ НОВОЕ ИЗМЕНЕНИЕ: Импорт fs/promises

const dbPath = path.join(process.cwd(), 'photos.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS photos (
                                              id TEXT PRIMARY KEY,
                                              title TEXT NOT NULL,
                                              filename TEXT NOT NULL,
                                              filepath TEXT NOT NULL
        )
    `);
});

export interface Photo {
    id: string;
    title: string;
    filename: string;
    filepath: string;
}

export function getAllPhotos(): Promise<Photo[]> {
    return new Promise((resolve) => {
        db.all('SELECT * FROM photos', [], (err, rows: any[]) => {
            resolve(rows as Photo[]);
        });
    });
}

export function createPhoto(data: { title: string; filename: string; filepath: string }): Promise<Photo> {
    return new Promise((resolve, reject) => {
        const id = Date.now().toString();
        db.run(
            'INSERT INTO photos (id, title, filename, filepath) VALUES (?, ?, ?, ?)',
            [id, data.title, data.filename, data.filepath],
            function(err) {
                if (err) reject(err);
                else resolve({ id, ...data });
            }
        );
    });
}

export function getPhotoById(id: string): Promise<Photo | null> {
    return new Promise((resolve) => {
        db.get('SELECT * FROM photos WHERE id = ?', [id], (err, row: any) => {
            resolve(row as Photo || null);
        });
    });
}

export function updatePhoto(id: string, data: Partial<Photo>): Promise<Photo | null> {
    return new Promise((resolve) => {
        db.get('SELECT * FROM photos WHERE id = ?', [id], (err, row: any) => {
            if (!row) return resolve(null);

            const updates: any = {};
            if (data.title !== undefined) updates.title = data.title;

            db.run(
                `UPDATE photos SET ${Object.keys(updates).map(k => `${k}=?`).join(',')} WHERE id = ?`,
                [...Object.values(updates), id],
                () => resolve({ id, ...row, ...updates } as Photo)
            );
        });
    });
}

// ✅ НОВОЕ ИЗМЕНЕНИЕ: Полное удаление файла + БД
export function deletePhoto(id: string): Promise<boolean> {
    return new Promise(async (resolve) => {
        const photo = await getPhotoById(id);
        if (!photo) return resolve(false);

        try {
            // ✅ НОВОЕ ИЗМЕНЕНИЕ: Удаляем физический файл
            const fullPath = path.join(process.cwd(), photo.filepath.replace('/uploads/', 'uploads/'));
            await fs.unlink(fullPath);
            console.log(`Удалён файл: ${fullPath}`);
        } catch (err) {
            console.error('Ошибка удаления файла:', err);  // Лог, но не фатально
        }

        // ✅ НОВОЕ ИЗМЕНЕНИЕ: Удаляем из БД
        db.run('DELETE FROM photos WHERE id = ?', [id], function(err) {
            resolve(this.changes > 0);
        });
    });
}

process.on('SIGINT', () => db.close());
