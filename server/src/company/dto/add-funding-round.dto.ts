import { IsString, IsNumber, IsDateString, IsArray, ArrayMinSize } from 'class-validator';

export class AddFundingRoundDto {
  @IsString()
  stage: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  investors: string[];
}
