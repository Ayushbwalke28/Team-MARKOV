import { IsEnum, IsOptional } from 'class-validator';

export enum DocumentTypeEnum {
  passport = 'passport',
  drivers_license = 'drivers_license',
  aadhaar = 'aadhaar',
  pan_card = 'pan_card',
  national_id = 'national_id',
}

export class StartVerificationDto {
  @IsOptional()
  @IsEnum(DocumentTypeEnum)
  documentType?: DocumentTypeEnum;
}
