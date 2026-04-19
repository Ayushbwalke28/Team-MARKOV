"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GstCrosscheckService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GstCrosscheckService = void 0;
const common_1 = require("@nestjs/common");
let GstCrosscheckService = GstCrosscheckService_1 = class GstCrosscheckService {
    constructor() {
        this.logger = new common_1.Logger(GstCrosscheckService_1.name);
        this.GST_API_BASE = process.env.GST_API_BASE_URL || 'https://api.gst.gov.in/commonapi';
        this.NAME_MATCH_THRESHOLD = Number(process.env.CLAIM_NAME_MATCH_THRESHOLD || 0.8);
    }
    isValidGstinFormat(gstin) {
        return /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/.test(gstin.toUpperCase());
    }
    isValidCinFormat(cin) {
        return /^[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/.test(cin.toUpperCase());
    }
    async crossCheckGstin(gstin, companyName) {
        if (!this.isValidGstinFormat(gstin)) {
            return {
                valid: false,
                nameMatch: false,
                active: false,
                reason: `Invalid GSTIN format: "${gstin}" does not match the 15-character Indian GST pattern`,
            };
        }
        try {
            const apiKey = process.env.GST_API_KEY;
            const url = `${this.GST_API_BASE}/search?gstin=${gstin.toUpperCase()}`;
            const headers = {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            };
            if (apiKey)
                headers['Authorization'] = `Bearer ${apiKey}`;
            const response = await fetch(url, { headers });
            if (!response.ok) {
                this.logger.warn(`GST API returned ${response.status} – using format-only check`);
                return this.formatOnlyResult(gstin);
            }
            const data = await response.json();
            const active = data.sts?.toLowerCase() === 'active';
            const legalName = data.lgnm ?? '';
            const tradeName = data.tradeNam ?? '';
            const nameMatchScore = Math.max(this.tokenOverlapScore(legalName, companyName), this.tokenOverlapScore(tradeName, companyName));
            const nameMatch = nameMatchScore >= this.NAME_MATCH_THRESHOLD;
            this.logger.log(`GST check for "${companyName}" vs GSTIN ${gstin}: nameMatch=${nameMatch} (score=${nameMatchScore.toFixed(2)}), active=${active}`);
            return {
                valid: true,
                nameMatch,
                active,
                legalName,
                tradeName,
                status: data.sts,
                registrationDate: data.rgdt,
                reason: nameMatch
                    ? `Name matched (score: ${(nameMatchScore * 100).toFixed(0)}%)`
                    : `Name mismatch – GSTIN registered to "${legalName}" (score: ${(nameMatchScore * 100).toFixed(0)}%)`,
            };
        }
        catch (err) {
            this.logger.error('GST API call failed:', err);
            return this.formatOnlyResult(gstin);
        }
    }
    tokenOverlapScore(a, b) {
        const tokenize = (s) => s
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(/\s+/)
            .filter(Boolean);
        const tokensA = new Set(tokenize(a));
        const tokensB = new Set(tokenize(b));
        if (tokensA.size === 0 || tokensB.size === 0)
            return 0;
        let overlap = 0;
        tokensA.forEach((t) => { if (tokensB.has(t))
            overlap++; });
        return overlap / Math.max(tokensA.size, tokensB.size);
    }
    formatOnlyResult(gstin) {
        return {
            valid: true,
            nameMatch: false,
            active: false,
            reason: 'GST API unavailable – format is valid but name match could not be confirmed. Escalated to admin review.',
        };
    }
};
exports.GstCrosscheckService = GstCrosscheckService;
exports.GstCrosscheckService = GstCrosscheckService = GstCrosscheckService_1 = __decorate([
    (0, common_1.Injectable)()
], GstCrosscheckService);
//# sourceMappingURL=gst-crosscheck.service.js.map