import { IsBoolean } from 'class-validator';

export class SetVerificationDto {
  @IsBoolean()
  verified!: boolean;
}

