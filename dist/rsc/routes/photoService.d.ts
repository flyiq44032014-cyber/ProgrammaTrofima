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
//# sourceMappingURL=photoService.d.ts.map