import { OpportunityType, OpportunityMode, OpportunityStatus } from '@prisma/client';
import { IsEnum, IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateOpportunityDto {
  @IsOptional()
  @IsEnum(OpportunityType)
  type?: OpportunityType;

  @IsOptional()
  @IsEnum(OpportunityMode)
  mode?: OpportunityMode;

  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;

  @IsOptional()
  @IsString()
  payment?: string;

  @IsOptional()
  @IsString()
  postName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;
}
