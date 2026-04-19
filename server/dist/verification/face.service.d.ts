export interface FaceDetectionResult {
    detected: boolean;
    confidence: number;
    faceCount: number;
}
export interface FaceComparisonResult {
    match: boolean;
    similarity: number;
}
export declare class FaceService {
    private readonly logger;
    detectFace(imageBuffer: Buffer): Promise<FaceDetectionResult>;
    compareFaces(idImageBuffer: Buffer, selfieBuffer: Buffer): Promise<FaceComparisonResult>;
    analyzeLiveness(selfieBuffer: Buffer): Promise<boolean>;
    private countSkinPixels;
    private extractFaceHistogram;
    private compareHistograms;
    private detectScreenCapture;
    private checkNaturalColors;
}
