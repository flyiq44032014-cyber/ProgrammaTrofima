import * as express from "express";
export declare const getPhotos: (req: express.Request, res: express.Response) => void;
export declare const createPhotoHandler: (req: express.Request, res: express.Response) => express.Response<any, Record<string, any>> | undefined;
export declare const getPhoto: (req: express.Request, res: express.Response) => express.Response<any, Record<string, any>> | undefined;
export declare const updatePhotoHandler: (req: express.Request, res: express.Response) => express.Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=photoController.d.ts.map