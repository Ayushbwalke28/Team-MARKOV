import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';

export class UploadDocumentDto {
  @IsString()
  @IsNotEmpty()
  documentType: string;

  /**
   * URL of the primary business registration document (e.g. GST certificate, trade license).
   */
  @IsUrl()
  @IsNotEmpty()
  fileUrl: string;

  /**
   * URL of the company's Incorporation Certificate / Certificate of Incorporation (optional).
   * Providing this strengthens the AI verification score.
   */
  @IsOptional()
  @IsUrl()
  incorporationCertUrl?: string;
}
