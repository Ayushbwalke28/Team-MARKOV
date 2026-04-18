import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReviewDecisionEnum {
  approved = 'approved',
  rejected = 'rejected',
}

export class ReviewDecisionDto {
  @IsEnum(ReviewDecisionEnum)
  decision!: ReviewDecisionEnum;

  @IsOptional()
  @IsString()
  notes?: string;
}
