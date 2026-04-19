export declare enum ReviewDecisionEnum {
    approved = "approved",
    rejected = "rejected"
}
export declare class ReviewDecisionDto {
    decision: ReviewDecisionEnum;
    notes?: string;
}
