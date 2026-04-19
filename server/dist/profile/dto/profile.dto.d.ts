declare const genderValues: readonly ["male", "female", "non_binary", "other", "prefer_not_to_say"];
export type Gender = (typeof genderValues)[number];
export declare class EducationDto {
    institution: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: Date;
    endDate?: Date;
    grade?: string;
    description?: string;
}
export declare class ExperienceDto {
    title: string;
    company?: string;
    location?: string;
    employmentType?: string;
    startDate?: Date;
    endDate?: Date;
    isCurrent?: boolean;
    description?: string;
}
export declare class CertificateDto {
    title: string;
    issuer?: string;
    issueDate?: Date;
    expirationDate?: Date;
    credentialId?: string;
    credentialUrl?: string;
    description?: string;
}
export declare class UpdateProfileDto {
    fullName?: string;
    about?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    dob?: Date;
    gender?: Gender;
    pronouns?: string;
    education?: EducationDto[];
    experience?: ExperienceDto[];
    certificates?: CertificateDto[];
}
export {};
