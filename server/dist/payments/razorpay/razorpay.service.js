"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RazorpayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RazorpayService = void 0;
const common_1 = require("@nestjs/common");
const Razorpay = require('razorpay');
const crypto = require("crypto");
let RazorpayService = RazorpayService_1 = class RazorpayService {
    constructor() {
        this.logger = new common_1.Logger(RazorpayService_1.name);
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_id',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret',
        });
    }
    async createOrder(amount, currency = 'INR', receipt) {
        this.logger.log(`Creating Razorpay order: ${amount} ${currency} for receipt ${receipt}`);
        const options = {
            amount: Math.round(amount * 100),
            currency,
            receipt,
        };
        try {
            const order = await this.razorpay.orders.create(options);
            return order;
        }
        catch (error) {
            this.logger.error('Error creating Razorpay order', error);
            throw error;
        }
    }
    verifyPayment(orderId, paymentId, signature) {
        this.logger.log(`Verifying Razorpay payment: orderId=${orderId}, paymentId=${paymentId}`);
        const secret = process.env.RAZORPAY_KEY_SECRET || 'mock_secret';
        const body = orderId + '|' + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');
        const isValid = expectedSignature === signature;
        if (!isValid) {
            this.logger.warn(`Invalid Razorpay signature for paymentId=${paymentId}`);
        }
        return isValid;
    }
};
exports.RazorpayService = RazorpayService;
exports.RazorpayService = RazorpayService = RazorpayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RazorpayService);
//# sourceMappingURL=razorpay.service.js.map