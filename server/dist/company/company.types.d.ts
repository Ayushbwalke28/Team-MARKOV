export type CompanyId = string;
export type Company = {
    id: CompanyId;
    name: string;
    ownerId: string;
    location: string | null;
    startYear: number | null;
    description: string | null;
    size: string | null;
    domain: string | null;
    createdAt: Date;
    updatedAt: Date;
};
