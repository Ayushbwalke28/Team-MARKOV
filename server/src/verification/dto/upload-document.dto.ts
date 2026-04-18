import { IsEnum } from 'class-validator';
import { DocumentTypeEnum } from './start-verification.dto';

export class UploadDocumentDto {
  @IsEnum(DocumentTypeEnum)
  documentType!: DocumentTypeEnum;
}
