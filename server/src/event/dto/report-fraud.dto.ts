import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ReportFraudDto {
  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  details?: string;
}
