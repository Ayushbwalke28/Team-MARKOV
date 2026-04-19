import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class GstValidateDto {
  @IsString()
  @IsNotEmpty()
  gstin: string;

  @IsString()
  @IsOptional()
  cinNumber?: string;
}
