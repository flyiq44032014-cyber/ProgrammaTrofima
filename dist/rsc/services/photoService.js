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
//# sourceMappingURL=photoService.js.map