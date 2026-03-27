import { Pool } from "pg";

let pool: InstanceType<typeof Pool> | null = null;
let schemaInitPromise: Promise<void> | null = null;

function getPool(): InstanceType<typeof Pool> {
    if (pool) return pool;

    const connectionString = process.env.TROFIM_POSTGRES_URL;
    if (!connectionString) {
        throw new Error("TROFIM_POSTGRES_URL is not configured");
    }

    pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });
    return pool;
}

async function ensureSchema(): Promise<void> {
    if (schemaInitPromise) {
        await schemaInitPromise;
        return;
    }

    schemaInitPromise = (async () => {
        const db = getPool();
        await db.query(`
          CREATE TABLE IF NOT EXISTS photos (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            cloudinary_public_id TEXT
          )
        `);

        await db.query(`
          ALTER TABLE photos
          ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT
        `);
    })();

    await schemaInitPromise;
}

export interface Photo {
    id: string;
    title: string;
    filename: string;
    filepath: string;
    cloudinary_public_id: string | null;
}

export async function getAllPhotos(): Promise<Photo[]> {
    await ensureSchema();
    const result = await getPool().query("SELECT * FROM photos");
    return result.rows;
}

export async function createPhoto(data: {
    title: string;
    filename: string;
    filepath: string;
    cloudinary_public_id: string;
}): Promise<Photo> {
    await ensureSchema();
    const id = Date.now().toString();
    await getPool().query(
        "INSERT INTO photos (id, title, filename, filepath, cloudinary_public_id) VALUES ($1,$2,$3,$4,$5)",
        [id, data.title, data.filename, data.filepath, data.cloudinary_public_id]
    );
    return { id, ...data };
}

export async function getPhotoById(id: string): Promise<Photo | null> {
    await ensureSchema();
    const result = await getPool().query("SELECT * FROM photos WHERE id=$1", [id]);
    return result.rows[0] || null;
}

export async function deletePhoto(id: string): Promise<boolean> {
    await ensureSchema();
    const result = await getPool().query("DELETE FROM photos WHERE id=$1", [id]);
    return (result.rowCount ?? 0) > 0;
}

export async function updatePhoto(id: string, data: Partial<Photo>): Promise<Photo | null> {
    await ensureSchema();
    const photo = await getPhotoById(id);
    if (!photo) return null;
    await getPool().query("UPDATE photos SET title=$1 WHERE id=$2", [data.title, id]);
    return { ...photo, title: data.title! };
}
