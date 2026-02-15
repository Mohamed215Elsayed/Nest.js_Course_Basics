import { IsString, IsNumber, Min, Length, IsNotEmpty, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  // @IsString({message: 'Title must be a string ,this custom message '})
  @IsString()
  @Length(2, 100)
  @IsNotEmpty()
  @Matches(/^(?!\s*$).+/, { message: 'Title cannot be empty spaces' })
  title: string;

  @IsString()
  @Length(5, 1000)
  @IsNotEmpty()
  description: string;


  @Type(() => Number) // مهم عشان يحول من string لـ number
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a valid number with up to 2 decimal places' },
  )
  @Min(0.01)
  price: number;
}
