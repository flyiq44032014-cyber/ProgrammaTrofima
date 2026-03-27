import { Pool } from 'pg';


const pool = new Pool({
    connectionString: process.env.TROFIM_POSTGRES_URL!,  // ТВОЯ БД!
    ssl: { rejectUnauthorized: false }
});

export interface Photo {
    id: string;
    title: string;
    filename: string;
    filepath: string;
    cloudinary_public_id: string | null;
}

await pool.query(`
  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    cloudinary_public_id TEXT
  )
`);

await pool.query(`
  ALTER TABLE photos
  ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT
`);

export async function getAllPhotos(): Promise<Photo[]> {
    const result = await pool.query('SELECT * FROM photos');
    return result.rows;
}

export async function createPhoto(data: {
    title: string;
    filename: string;
    filepath: string;
    cloudinary_public_id: string;
}): Promise<Photo> {
    const id = Date.now().toString();
    await pool.query(
        'INSERT INTO photos (id, title, filename, filepath, cloudinary_public_id) VALUES ($1,$2,$3,$4,$5)',
        [id, data.title, data.filename, data.filepath, data.cloudinary_public_id]
    );
    return { id, ...data };
}

export async function getPhotoById(id: string): Promise<Photo | null> {
    const result = await pool.query('SELECT * FROM photos WHERE id=$1', [id]);
    return result.rows[0] || null;
}

export async function deletePhoto(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM photos WHERE id=$1', [id]);
    return (result.rowCount ?? 0) > 0;  // ?? = если null то 0
}

export async function updatePhoto(id: string, data: Partial<Photo>): Promise<Photo | null> {
    const photo = await getPhotoById(id);
    if (!photo) return null;
    await pool.query('UPDATE photos SET title=$1 WHERE id=$2', [data.title, id]);
    return { ...photo, title: data.title! };
}