export declare class RazorpayService {
    private razorpay;
    private readonly logger;
    constructor();
    createOrder(amount: number, currency: string, receipt: string): Promise<any>;
    verifyPayment(orderId: string, paymentId: string, signature: string): boolean;
}
