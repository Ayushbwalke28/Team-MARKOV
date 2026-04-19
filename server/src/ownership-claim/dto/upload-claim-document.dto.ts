import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';

export class UploadClaimDocumentDto {
  @IsUrl()
  @IsNotEmpty()
  authorizationLetterUrl: string;

  @IsUrl()
  @IsOptional()
  governmentIdUrl?: string;
}
