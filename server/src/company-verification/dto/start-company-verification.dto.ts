import { IsString, IsNotEmpty, Matches, MinLength, MaxLength, IsOptional } from 'class-validator';

export class StartCompanyVerificationDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  /**
   * GSTIN – 15-character Indian Goods and Services Tax Identification Number.
   * Format: 2-digit state code + 10-char PAN + 1-digit entity number + Z + 1-digit checksum
   * Example: 22AAAAA0000A1Z5
   */
  @IsString()
  @IsNotEmpty({ message: 'GSTIN is required for company verification' })
  @Matches(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/i, {
    message: 'GSTIN must be a valid 15-character Indian GST Identification Number (e.g. 22AAAAA0000A1Z5)',
  })
  gstin: string;

  /**
   * CIN – Corporate Identification Number issued by the Ministry of Corporate Affairs.
   * Format: U/L + 5 digits + 2-letter state code + 4-digit year + 3-letter company type + 6-digit number
   * Example: U12345MH2020PTC123456
   */
  @IsOptional()
  @IsString()
  @Matches(/^[UL]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/i, {
    message: 'CIN must follow the format: U/L + 5 digits + state code + year + company type + 6 digits (e.g. U12345MH2020PTC123456)',
  })
  cinNumber?: string;
}
