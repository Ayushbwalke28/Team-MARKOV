import { UserRoleType } from '../../users/users.types';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: UserRoleType[]) => import("@nestjs/common").CustomDecorator<string>;
