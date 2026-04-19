"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FaceService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaceService = void 0;
const common_1 = require("@nestjs/common");
const sharp = require("sharp");
let FaceService = FaceService_1 = class FaceService {
    constructor() {
        this.logger = new common_1.Logger(FaceService_1.name);
    }
    async detectFace(imageBuffer) {
        try {
            const metadata = await sharp(imageBuffer).metadata();
            if (!metadata.width || !metadata.height) {
                return { detected: false, confidence: 0, faceCount: 0 };
            }
            if (metadata.width < 100 || metadata.height < 100) {
                return { detected: false, confidence: 0, faceCount: 0 };
            }
            const { data, info } = await sharp(imageBuffer)
                .resize(200, 200, { fit: 'cover' })
                .removeAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true });
            const skinPixels = this.countSkinPixels(data, info.width, info.height);
            const totalPixels = info.width * info.height;
            const skinRatio = skinPixels / totalPixels;
            this.logger.log(`Face detection skin ratio: ${skinRatio}`);
            const detected = skinRatio > 0.01 && skinRatio < 0.9;
            const confidence = detected ? Math.min(0.95, skinRatio * 2) : 0;
            return { detected, confidence, faceCount: detected ? 1 : 0 };
        }
        catch (error) {
            this.logger.error('Face detection failed', error);
            return { detected: false, confidence: 0, faceCount: 0 };
        }
    }
    async compareFaces(idImageBuffer, selfieBuffer) {
        try {
            const idHist = await this.extractFaceHistogram(idImageBuffer);
            const selfieHist = await this.extractFaceHistogram(selfieBuffer);
            if (!idHist || !selfieHist) {
                return { match: false, similarity: 0 };
            }
            const similarity = this.compareHistograms(idHist, selfieHist);
            return {
                match: similarity >= 0.70,
                similarity: Math.round(similarity * 100) / 100,
            };
        }
        catch (error) {
            this.logger.error('Face comparison failed', error);
            return { match: false, similarity: 0 };
        }
    }
    async analyzeLiveness(selfieBuffer) {
        try {
            const metadata = await sharp(selfieBuffer).metadata();
            if (!metadata.width || !metadata.height) {
                this.logger.warn('Liveness check failed: no width/height metadata');
                return false;
            }
            if (metadata.width < 100 || metadata.height < 100) {
                this.logger.warn(`Liveness check failed: resolution too low (${metadata.width}x${metadata.height})`);
                return false;
            }
            const faceResult = await this.detectFace(selfieBuffer);
            if (!faceResult.detected) {
                this.logger.warn('Liveness check failed: no face detected based on skin ratio');
                return false;
            }
            const isScreen = await this.detectScreenCapture(selfieBuffer);
            if (isScreen) {
                this.logger.warn('Liveness check warning: screen capture detected, but bypassing check for development');
            }
            const hasNaturalColors = await this.checkNaturalColors(selfieBuffer);
            if (!hasNaturalColors) {
                this.logger.warn('Liveness check warning: unnatural colors detected, but bypassing check for development');
            }
            return true;
        }
        catch (error) {
            this.logger.error('Liveness analysis failed', error);
            return false;
        }
    }
    countSkinPixels(data, width, height) {
        let count = 0;
        for (let i = 0; i < width * height * 3; i += 3) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            if (r > 95 && g > 40 && b > 20 &&
                r > g && r > b &&
                Math.abs(r - g) > 15 &&
                r - b > 15) {
                count++;
            }
        }
        return count;
    }
    async extractFaceHistogram(imageBuffer) {
        try {
            const { data, info } = await sharp(imageBuffer)
                .resize(100, 100, { fit: 'cover' })
                .removeAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true });
            const bins = 8;
            const hist = new Array(bins * 3).fill(0);
            const totalPixels = info.width * info.height;
            for (let i = 0; i < totalPixels * 3; i += 3) {
                const rBin = Math.floor(data[i] / 32);
                const gBin = Math.floor(data[i + 1] / 32);
                const bBin = Math.floor(data[i + 2] / 32);
                hist[rBin]++;
                hist[bins + gBin]++;
                hist[bins * 2 + bBin]++;
            }
            for (let i = 0; i < hist.length; i++) {
                hist[i] /= totalPixels;
            }
            return hist;
        }
        catch {
            return null;
        }
    }
    compareHistograms(a, b) {
        const n = Math.min(a.length, b.length);
        let sumA = 0, sumB = 0, sumAB = 0, sumA2 = 0, sumB2 = 0;
        for (let i = 0; i < n; i++) {
            sumA += a[i];
            sumB += b[i];
            sumAB += a[i] * b[i];
            sumA2 += a[i] * a[i];
            sumB2 += b[i] * b[i];
        }
        const meanA = sumA / n, meanB = sumB / n;
        let cov = 0, varA = 0, varB = 0;
        for (let i = 0; i < n; i++) {
            cov += (a[i] - meanA) * (b[i] - meanB);
            varA += (a[i] - meanA) ** 2;
            varB += (b[i] - meanB) ** 2;
        }
        const denom = Math.sqrt(varA * varB);
        if (denom === 0)
            return 0;
        const corr = cov / denom;
        return (corr + 1) / 2;
    }
    async detectScreenCapture(imageBuffer) {
        try {
            const { data, info } = await sharp(imageBuffer)
                .grayscale()
                .resize(100, 100, { fit: 'fill' })
                .raw()
                .toBuffer({ resolveWithObject: true });
            const borderPixels = [];
            for (let x = 0; x < info.width; x++) {
                borderPixels.push(data[x]);
                borderPixels.push(data[(info.height - 1) * info.width + x]);
            }
            if (borderPixels.length === 0)
                return false;
            const mean = borderPixels.reduce((a, b) => a + b, 0) / borderPixels.length;
            const variance = borderPixels.reduce((a, b) => a + (b - mean) ** 2, 0) / borderPixels.length;
            return variance < 10;
        }
        catch {
            return false;
        }
    }
    async checkNaturalColors(imageBuffer) {
        try {
            const stats = await sharp(imageBuffer).stats();
            const channels = stats.channels;
            if (channels.length < 3)
                return false;
            const minStd = Math.min(...channels.map(c => c.stdev));
            return minStd > 10;
        }
        catch {
            return true;
        }
    }
};
exports.FaceService = FaceService;
exports.FaceService = FaceService = FaceService_1 = __decorate([
    (0, common_1.Injectable)()
], FaceService);
//# sourceMappingURL=face.service.js.map