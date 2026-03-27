import sqlite3 from 'sqlite3';
import path from 'path';
import type { Database, RunResult } from 'sqlite3';

const dbPath = path.join(process.cwd(), 'photos.db');
const db: Database = new sqlite3.Database(dbPath);

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

export async function getAllPhotos(): Promise<Photo[]> {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM photos', [], (err, rows: Photo[]) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

export async function createPhoto(data: { title: string; filename: string; filepath: string }): Promise<Photo> {
    return new Promise((resolve, reject) => {
        const id = Date.now().toString();
        db.run(
            'INSERT INTO photos (id, title, filename, filepath) VALUES (?, ?, ?, ?)',
            [id, data.title, data.filename, data.filepath],
            function(err: Error | null) {
                if (err) reject(err);
                else resolve({ id, ...data });
            }
        );
    });
}

export async function getPhotoById(id: string): Promise<Photo | null> {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM photos WHERE id = ?', [id], (err: Error | null, row: Photo | undefined) => {
            if (err) reject(err);
            else resolve(row ?? null);
        });
    });
}

export async function updatePhoto(id: string, data: Partial<Photo>): Promise<Photo | null> {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM photos WHERE id = ?', [id], (err: Error | null, row: Photo | undefined) => {
            if (err) return reject(err);
            if (!row) return resolve(null);

            const updates: Record<string, string> = {};
            if (data.title !== undefined) updates.title = data.title;

            const updateKeys = Object.keys(updates);
            if (updateKeys.length === 0) return resolve(row);

            db.run(
                `UPDATE photos SET ${updateKeys.map(k => `${k}=?`).join(',')} WHERE id = ?`,
                [...Object.values(updates), id],
                function(err: Error | null) {
                    if (err) reject(err);
                    else resolve({ ...row, ...updates });
                }
            );
        });
    });
}

export async function deletePhoto(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM photos WHERE id = ?', [id], function(err: Error | null) {
            if (err) reject(err);
            else resolve(this.changes > 0);
        });
    });
}

process.on('SIGINT', () => {
    db.close((err) => {
        if (err) console.error('Ошибка закрытия БД:', err);
        process.exit(0);
    });
});