import { IsBoolean } from 'class-validator';

export class SetOwnsCompanyDto {
  @IsBoolean()
  ownsCompany: boolean;
}
