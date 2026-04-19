import { Injectable, Logger } from '@nestjs/common';
const Razorpay = require('razorpay');
import * as crypto from 'crypto';

@Injectable()
export class RazorpayService {
  private razorpay: any;
  private readonly logger = new Logger(RazorpayService.name);

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_id',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret',
    });
  }

  async createOrder(amount: number, currency: string = 'INR', receipt: string) {
    this.logger.log(`Creating Razorpay order: ${amount} ${currency} for receipt ${receipt}`);
    
    // Razorpay amount is in paise (1 INR = 100 paise)
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt,
    };

    try {
      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      this.logger.error('Error creating Razorpay order', error);
      throw error;
    }
  }

  verifyPayment(orderId: string, paymentId: string, signature: string): boolean {
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
}
