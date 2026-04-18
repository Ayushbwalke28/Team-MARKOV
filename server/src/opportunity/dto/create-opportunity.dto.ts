import { OpportunityType, OpportunityMode, OpportunityStatus } from '@prisma/client';
import { IsEnum, IsString, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateOpportunityDto {
  @IsEnum(OpportunityType)
  type: OpportunityType;

  @IsEnum(OpportunityMode)
  mode: OpportunityMode;

  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;

  @IsOptional()
  @IsString()
  payment?: string;

  @IsString()
  @IsNotEmpty()
  postName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  registrationDeadline?: string;
}
