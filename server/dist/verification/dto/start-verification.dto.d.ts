export declare enum DocumentTypeEnum {
    passport = "passport",
    drivers_license = "drivers_license",
    aadhaar = "aadhaar",
    pan_card = "pan_card",
    national_id = "national_id"
}
export declare class StartVerificationDto {
    documentType?: DocumentTypeEnum;
}
