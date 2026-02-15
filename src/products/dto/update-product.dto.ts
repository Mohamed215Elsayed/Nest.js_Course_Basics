// import { PartialType } from '@nestjs/mapped-types';
// import { CreateProductDto } from './create-product.dto';
// export class UpdateProductDto extends PartialType(CreateProductDto) {}
import {
  IsString,
  IsNumber,
  Min,
  Length,
  IsOptional,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Matches(/^(?!\s*$).+/, { message: 'Title cannot be empty spaces' })
  title?: string;

  @IsOptional()
  @IsString()
  @Length(5, 1000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Price must be a valid number with up to 2 decimal places' },
  )
  @Min(0.01)
  price?: number;
}
