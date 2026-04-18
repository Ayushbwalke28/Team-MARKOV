import { OrganizerType, EventMode } from '@prisma/client';
import { IsEnum, IsString, IsOptional, IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsEnum(OrganizerType)
  organizerType: OrganizerType;

  @IsDateString()
  schedule: string;

  @IsOptional()
  @IsNumber()
  fees?: number;

  @IsEnum(EventMode)
  mode: EventMode;

  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsString()
  onlinePlatform?: string;
}
