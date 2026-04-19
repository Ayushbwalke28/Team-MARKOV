import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum AdminDecision {
  approved = 'approved',
  rejected = 'rejected',
}

export enum AdminGrantRole {
  owner = 'owner',
  founder = 'founder',
  authorized = 'authorized',
}

export class AdminDecideClaimDto {
  @IsEnum(AdminDecision)
  decision: AdminDecision;

  @IsOptional()
  @IsEnum(AdminGrantRole)
  grantRole?: AdminGrantRole;

  @IsString()
  @IsNotEmpty()
  notes: string;
}
