export interface Photo {
    id: string;
    title: string;
    filename: string;
    filepath: string;
}
export declare function getAllPhotos(): Photo[];
export declare function createPhoto(data: {
    title: string;
    filename: string;
    filepath: string;
}): Photo;
export declare function getPhotoById(id: string): Photo | null;
export declare function updatePhoto(id: string, data: Partial<Photo>): Photo | null;
export declare function deletePhoto(id: string): boolean;
//# sourceMappingURL=photoService.d.ts.map