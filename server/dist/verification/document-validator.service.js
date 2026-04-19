"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DocumentValidatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentValidatorService = void 0;
const common_1 = require("@nestjs/common");
const sharp = require("sharp");
const BLUR_THRESHOLD = 100;
const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;
let DocumentValidatorService = DocumentValidatorService_1 = class DocumentValidatorService {
    constructor() {
        this.logger = new common_1.Logger(DocumentValidatorService_1.name);
    }
    async validateDocument(parsedDoc, imageBuffer, documentType) {
        const issues = [];
        let isExpired = false;
        let isBlurry = false;
        let isTampered = false;
        if (parsedDoc.expiry) {
            isExpired = this.isDocumentExpired(parsedDoc.expiry);
            if (isExpired)
                issues.push('Document appears to be expired');
        }
        if (parsedDoc.idNumber) {
            if (!this.validateIdNumberFormat(parsedDoc.idNumber, documentType)) {
                issues.push(`ID number does not match expected format for ${documentType}`);
            }
        }
        else {
            issues.push('Could not extract ID number from document');
        }
        try {
            isBlurry = await this.isImageBlurry(imageBuffer);
            if (isBlurry)
                issues.push('Document image appears blurry or low quality');
        }
        catch (e) {
            this.logger.warn('Blur detection failed', e);
        }
        try {
            if (!(await this.checkMinDimensions(imageBuffer))) {
                issues.push('Document image is too small or may be cropped');
            }
        }
        catch (e) {
            this.logger.warn('Dimension check failed', e);
        }
        try {
            isTampered = await this.detectTampering(imageBuffer);
            if (isTampered)
                issues.push('Document shows signs of possible manipulation');
        }
        catch (e) {
            this.logger.warn('Tamper detection failed', e);
        }
        const isValid = !isExpired && !isBlurry && !isTampered && issues.length === 0;
        return { isValid, isExpired, isBlurry, isTampered, issues };
    }
    isDocumentExpired(expiryDateStr) {
        try {
            const expiry = new Date(expiryDateStr);
            if (isNaN(expiry.getTime()))
                return false;
            return expiry < new Date();
        }
        catch {
            return false;
        }
    }
    validateIdNumberFormat(idNumber, documentType) {
        const patterns = {
            aadhaar: /^\d{12}$/,
            pan_card: /^[A-Z]{5}\d{4}[A-Z]$/,
            passport: /^[A-Z]\d{7}$/,
            drivers_license: /^[A-Z]{2}\d{2}\d{4}\d{7}$/,
            national_id: /^[A-Z0-9]{6,20}$/,
        };
        const pattern = patterns[documentType];
        if (!pattern)
            return true;
        return pattern.test(idNumber);
    }
    async isImageBlurry(imageBuffer) {
        const { data, info } = await sharp(imageBuffer)
            .grayscale().raw().toBuffer({ resolveWithObject: true });
        const { width, height } = info;
        if (width < 10 || height < 10)
            return true;
        let sum = 0, sumSq = 0, count = 0;
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                const lap = 4 * data[idx] - data[(y - 1) * width + x] - data[(y + 1) * width + x] - data[y * width + (x - 1)] - data[y * width + (x + 1)];
                sum += lap;
                sumSq += lap * lap;
                count++;
            }
        }
        if (count === 0)
            return true;
        const mean = sum / count;
        const variance = sumSq / count - mean * mean;
        return variance < BLUR_THRESHOLD;
    }
    async checkMinDimensions(imageBuffer) {
        const metadata = await sharp(imageBuffer).metadata();
        if (!metadata.width || !metadata.height)
            return false;
        return metadata.width >= MIN_WIDTH && metadata.height >= MIN_HEIGHT;
    }
    async detectTampering(imageBuffer) {
        try {
            const metadata = await sharp(imageBuffer).metadata();
            if (metadata.format === 'jpeg' && metadata.size) {
                const pixels = (metadata.width || 1) * (metadata.height || 1);
                const bpp = (metadata.size * 8) / pixels;
                if (bpp < 0.5)
                    return true;
            }
            return false;
        }
        catch {
            return false;
        }
    }
};
exports.DocumentValidatorService = DocumentValidatorService;
exports.DocumentValidatorService = DocumentValidatorService = DocumentValidatorService_1 = __decorate([
    (0, common_1.Injectable)()
], DocumentValidatorService);
//# sourceMappingURL=document-validator.service.js.map