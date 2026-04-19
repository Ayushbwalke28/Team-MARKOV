"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OcrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrService = void 0;
const common_1 = require("@nestjs/common");
const ID_NUMBER_PATTERNS = {
    aadhaar: /\b\d{4}[ \t]?\d{4}[ \t]?\d{4}\b/,
    pan_card: /\b[A-Z]{5}\d{4}[A-Z]\b/,
    passport: /\b[A-Z]\d{7}\b/,
    drivers_license: /\b[A-Z]{2}\d{2}[ \t]?\d{4}[ \t]?\d{7}\b/,
    national_id: /\b[A-Z0-9]{6,20}\b/,
};
const DATE_PATTERNS = [
    /\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b/,
    /\b(\d{4})[\/\-](\d{2})[\/\-](\d{2})\b/,
    /\b(\d{2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{4})\b/i,
];
let OcrService = OcrService_1 = class OcrService {
    constructor() {
        this.logger = new common_1.Logger(OcrService_1.name);
        this.worker = null;
    }
    async getWorker() {
        if (!this.worker) {
            const Tesseract = await Promise.resolve().then(() => require('tesseract.js'));
            this.worker = await Tesseract.createWorker('eng');
        }
        return this.worker;
    }
    async extractText(imageBuffer) {
        try {
            const worker = await this.getWorker();
            const { data } = await worker.recognize(imageBuffer);
            return data.text || '';
        }
        catch (error) {
            this.logger.error('OCR extraction failed', error);
            return '';
        }
    }
    parseDocument(text, documentType) {
        const result = {
            name: null,
            dob: null,
            idNumber: null,
            expiry: null,
            address: null,
            rawText: text,
        };
        const idPattern = ID_NUMBER_PATTERNS[documentType];
        if (idPattern) {
            const idMatch = text.match(idPattern);
            if (idMatch) {
                result.idNumber = idMatch[0].replace(/\s/g, '');
            }
        }
        const dates = this.extractDates(text);
        if (dates.length > 0) {
            result.dob = dates[0];
        }
        if (dates.length > 1) {
            result.expiry = dates[1];
        }
        result.name = this.extractName(text, documentType);
        result.address = this.extractAddress(text);
        return result;
    }
    extractDates(text) {
        const months = {
            jan: '01', feb: '02', mar: '03', apr: '04',
            may: '05', jun: '06', jul: '07', aug: '08',
            sep: '09', oct: '10', nov: '11', dec: '12',
        };
        const dates = [];
        for (const pattern of DATE_PATTERNS) {
            const matches = text.matchAll(new RegExp(pattern, 'gi'));
            for (const match of matches) {
                const full = match[0];
                if (/^\d{4}/.test(full)) {
                    dates.push(full.replace(/\//g, '-'));
                }
                else if (/\d{2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(full)) {
                    const day = match[1];
                    const month = months[match[2].toLowerCase().substring(0, 3)] || '01';
                    const year = match[3];
                    dates.push(`${year}-${month}-${day.padStart(2, '0')}`);
                }
                else {
                    dates.push(`${match[3]}-${match[2]}-${match[1]}`);
                }
            }
        }
        return dates;
    }
    extractName(text, documentType) {
        const namePatterns = [
            /(?:Name|Naam)[ \t]*[:\-]?[ \t]*([A-Z][A-Za-z ]{2,40})/i,
            /(?:Given[ \t]+Name|First[ \t]+Name|Surname)[ \t]*[:\-]?[ \t]*([A-Z][A-Za-z ]{2,40})/i,
        ];
        if (documentType === 'aadhaar') {
            const lines = text.split('\n').filter((l) => l.trim().length > 2);
            if (lines.length >= 2) {
                const candidateLine = lines[1].trim();
                if (/^[A-Z][a-zA-Z\s]{2,40}$/.test(candidateLine)) {
                    return candidateLine;
                }
            }
        }
        for (const pattern of namePatterns) {
            const match = text.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }
        return null;
    }
    extractAddress(text) {
        const addressPattern = /(?:Address|addr|S\/O|D\/O|W\/O|C\/O)\s*[:\-]?\s*([\s\S]{10,200}?)(?:\n\n|\d{6})/i;
        const match = text.match(addressPattern);
        if (match) {
            return match[1].replace(/\n/g, ', ').trim();
        }
        return null;
    }
    validateIdFormat(idNumber, documentType) {
        const pattern = ID_NUMBER_PATTERNS[documentType];
        if (!pattern)
            return true;
        return pattern.test(idNumber);
    }
    async onModuleDestroy() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
        }
    }
};
exports.OcrService = OcrService;
exports.OcrService = OcrService = OcrService_1 = __decorate([
    (0, common_1.Injectable)()
], OcrService);
//# sourceMappingURL=ocr.service.js.map