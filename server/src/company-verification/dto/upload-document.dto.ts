import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class UploadDocumentDto {
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @IsUrl()
  @IsNotEmpty()
  fileUrl: string;
}
