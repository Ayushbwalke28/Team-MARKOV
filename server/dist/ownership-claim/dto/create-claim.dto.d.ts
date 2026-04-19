export declare enum RequestedRoleEnum {
    owner = "owner",
    founder = "founder",
    authorized = "authorized"
}
export declare class CreateClaimDto {
    companyId: string;
    requestedRole?: RequestedRoleEnum;
}
