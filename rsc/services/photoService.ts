import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs/promises';

const dbPath = path.join(process.cwd(), 'photos.db');
console.log('🗄️ SQLite path:', dbPath);  // ✅ Лог пути БД

// ✅ ПРОВЕРКА ПРАВ НА ЗАПИСЬ
const dbDir = path.dirname(dbPath);
console.log('🗄️ DB dir writable?', await fs.access(dbDir).then(() => 'YES', () => 'NO'));

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('💥 DB CONNECTION ERROR:', err.message);
    } else {
        console.log('✅ DB connected:', dbPath);
    }
});

db.serialize(() => {
    console.log('🗄️ Creating table...');
    db.run(`
        CREATE TABLE IF NOT EXISTS photos (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL
        )
    `, (err) => {
        if (err) console.error('💥 TABLE CREATE ERROR:', err);
        else console.log('✅ Table ready');
    });
});

export interface Photo {
    id: string;
    title: string;
    filename: string;
    filepath: string;
}

export function getAllPhotos(): Promise<Photo[]> {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM photos', [], (err, rows: any[]) => {
            if (err) {
                console.error('💥 getAllPhotos ERROR:', err);
                reject(err);
            } else {
                resolve(rows as Photo[]);
            }
        });
    });
}

export function createPhoto(data: { title: string; filename: string; filepath: string }): Promise<Photo> {
    return new Promise((resolve, reject) => {
        const id = Date.now().toString();
        console.log('🆕 Creating photo:', data.title);

        db.run(
            'INSERT INTO photos (id, title, filename, filepath) VALUES (?, ?, ?, ?)',
            [id, data.title, data.filename, data.filepath],
            function(err) {
                if (err) {
                    console.error('💥 createPhoto ERROR:', err);
                    reject(err);
                } else {
                    console.log('✅ Photo created:', id);
                    resolve({ id, ...data });
                }
            }
        );
    });
}

export function getPhotoById(id: string): Promise<Photo | null> {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM photos WHERE id = ?', [id], (err, row: any) => {
            if (err) {
                console.error('💥 getPhotoById ERROR:', err);
                reject(err);
            } else {
                resolve(row as Photo || null);
            }
        });
    });
}

export function updatePhoto(id: string, data: Partial<Photo>): Promise<Photo | null> {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM photos WHERE id = ?', [id], (err, row: any) => {
            if (err) {
                console.error('💥 updatePhoto SELECT ERROR:', err);
                reject(err);
                return;
            }

            if (!row) return resolve(null);

            const updates: any = {};
            if (data.title !== undefined) updates.title = data.title;

            db.run(
                `UPDATE photos SET ${Object.keys(updates).map(k => `${k}=?`).join(',')} WHERE id = ?`,
                [...Object.values(updates), id],
                function(err) {
                    if (err) {
                        console.error('💥 updatePhoto UPDATE ERROR:', err);
                        reject(err);
                    } else {
                        resolve({ id, ...row, ...updates } as Photo);
                    }
                }
            );
        });
    });
}

export function deletePhoto(id: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        try {
            const photo = await getPhotoById(id);
            if (!photo) return resolve(false);

            const fullPath = path.join(process.cwd(), photo.filepath.replace('/uploads/', 'uploads/'));
            await fs.unlink(fullPath).catch(err => console.log('⚠️ File delete warning:', err.message));

            db.run('DELETE FROM photos WHERE id = ?', [id], function(err) {
                if (err) {
                    console.error('💥 deletePhoto ERROR:', err);
                    reject(err);
                } else {
                    console.log('✅ Photo deleted:', id);
                    resolve(this.changes > 0);
                }
            });
        } catch (err) {
            console.error('💥 deletePhoto CATCH ERROR:', err);
            reject(err);
        }
    });
}

process.on('SIGINT', () => {
    console.log('🛑 Closing DB...');
    db.close((err) => {
        if (err) console.error('DB close error:', err);
        console.log('✅ DB closed');
        process.exit(0);
    });
});