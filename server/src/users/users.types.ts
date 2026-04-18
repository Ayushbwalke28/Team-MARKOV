export type UserId = string;

export type User = {
  id: UserId;
  email: string;
  name: string;
  passwordHash: string;
  refreshTokenHash: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicUser = Pick<User, 'id' | 'email' | 'name'>;

