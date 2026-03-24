let photos = [
    {
        id: "1",
        title: "первое фоторо",
        filename: "test.jpg",
        filepath: "/uploads/test.jpg",
    }
];
function generateId() {
    return String(Date.now());
}
export function getAllPhotos() {
    return photos;
}
export function createPhoto(data) {
    const newPhoto = {
        id: generateId(),
        title: data.title,
        filename: data.filename,
        filepath: data.filepath,
    };
    photos.push(newPhoto);
    return newPhoto;
}
export function getPhotoById(id) {
    return photos.find(photo => photo.id === id) || null;
}
export function updatePhoto(id, data) {
    const photoIndex = photos.findIndex(photo => photo.id === id);
    if (photoIndex === -1)
        return null;
    const oldPhoto = photos[photoIndex];
    if (!oldPhoto)
        return null; // TypeScript видит, что oldPhoto не undefined
    const updatedPhoto = {
        id: oldPhoto.id,
        title: data.title ?? oldPhoto.title,
        filename: data.filename ?? oldPhoto.filename,
        filepath: data.filepath ?? oldPhoto.filepath,
    };
    photos[photoIndex] = updatedPhoto;
    return updatedPhoto;
}
export function deletePhoto(id) {
    const photoIndex = photos.findIndex(photo => photo.id === id);
    if (photoIndex === -1)
        return false;
    photos.splice(photoIndex, 1);
    return true;
}
//# sourceMappingURL=photoService.js.map