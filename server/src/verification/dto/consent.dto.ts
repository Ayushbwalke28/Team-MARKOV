import { IsBoolean } from 'class-validator';

export class ConsentDto {
  @IsBoolean()
  consent!: boolean;
}
