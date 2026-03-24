export interface Photo {
    id: string;
    title: string;
    filename: string;
    filepath: string;
}
let photos: Photo [] = [
    {
        id:"1",
        title: "первое фоторо",
        filename: "test.jpg",
        filepath: "/uploads/test.jpg",
    }
];
function generateId(): string {
    return String(Date.now());
}
export function getAllPhotos():
    Photo[]{
    return photos;
}
export function createPhoto(data:{
    title: string;
    filename: string;
    filepath: string;
} ): Photo {
    const newPhoto: Photo={
        id: generateId(),
        title: data.title,
        filename: data.filename,
        filepath: data.filepath,
    }
    photos.push(newPhoto);
    return newPhoto;
}

export function getPhotoById(id: string): Photo | null {
    return photos.find(photo => photo.id === id) || null;
}

export function updatePhoto(id: string, data: Partial<Photo>): Photo | null {
    const photoIndex = photos.findIndex(photo => photo.id === id);
    if (photoIndex === -1) return null;

    const oldPhoto = photos[photoIndex];
    if (!oldPhoto) return null; // TypeScript видит, что oldPhoto не undefined

    const updatedPhoto: Photo = {
        id: oldPhoto.id,
        title: data.title ?? oldPhoto.title,
        filename: data.filename ?? oldPhoto.filename,
        filepath: data.filepath ?? oldPhoto.filepath,
    };

    photos[photoIndex] = updatedPhoto;
    return updatedPhoto;
}

export function deletePhoto(id: string): boolean {
    const photoIndex = photos.findIndex(photo => photo.id === id);
    if (photoIndex === -1) return false;

    photos.splice(photoIndex, 1);
    return true;
}
