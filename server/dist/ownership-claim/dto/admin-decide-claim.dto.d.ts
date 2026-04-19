export declare enum AdminDecision {
    approved = "approved",
    rejected = "rejected"
}
export declare enum AdminGrantRole {
    owner = "owner",
    founder = "founder",
    authorized = "authorized"
}
export declare class AdminDecideClaimDto {
    decision: AdminDecision;
    grantRole?: AdminGrantRole;
    notes: string;
}
