export type UserId = string;

export type User = {
  id: UserId;
  email: string;
  name: string;
  passwordHash: string;
  refreshTokenHash: string | null;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserRoleType = 'candidate' | 'company_owner';

export type PublicUser = Pick<User, 'id' | 'email' | 'name'> & {
  roles: UserRoleType[];
  verified: boolean;
};

export type CreateUserInput = {
  id: UserId;
  email: string;
  name: string;
  passwordHash: string;
};

