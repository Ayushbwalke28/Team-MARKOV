import { IsString, IsNotEmpty } from 'class-validator';

export class StartCompanyVerificationDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;
}
