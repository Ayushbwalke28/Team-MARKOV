import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum RequestedRoleEnum {
  owner = 'owner',
  founder = 'founder',
  authorized = 'authorized',
}

export class CreateClaimDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  /** Role the claimant is requesting (defaults to owner) */
  @IsOptional()
  @IsEnum(RequestedRoleEnum)
  requestedRole?: RequestedRoleEnum;
}
