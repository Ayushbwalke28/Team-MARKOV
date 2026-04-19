import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class SendDomainOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
