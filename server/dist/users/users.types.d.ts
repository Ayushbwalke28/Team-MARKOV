export type UserId = string;
export type User = {
    id: UserId;
    email: string;
    name: string;
    passwordHash: string | null;
    googleId: string | null;
    refreshTokenHash: string | null;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
};
export type UserRoleType = 'candidate' | 'company_owner' | 'admin';
export type PublicUser = Pick<User, 'id' | 'email' | 'name'> & {
    roles: UserRoleType[];
    verified: boolean;
};
export type CreateUserInput = {
    id: UserId;
    email: string;
    name: string;
    passwordHash?: string;
    googleId?: string;
};
