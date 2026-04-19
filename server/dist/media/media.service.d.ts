import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
export declare class MediaService {
    uploadImage(file: Express.Multer.File): Promise<UploadApiResponse | UploadApiErrorResponse>;
}
