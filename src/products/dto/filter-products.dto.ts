import { Type } from "class-transformer";
import {
    IsOptional, IsString, IsNumber, Min, IsEnum,
    ValidateIf
} from "class-validator";

export enum SortBy {
    PRICE = 'price',
    CREATED_AT = 'createdAt',
    RATING = 'averageRating',
}
export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class FilterProductsDto {
    // 🔎 Title search
    @IsOptional()
    @IsString()
    title?: string;

    // 💰 Price Range
    @IsOptional()
    @Type(() => Number)// يحول من string إلى number
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)   // يحول من string إلى number
    @Min(0)
    maxPrice?: number;

    // 📄 Pagination
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 10;

    // ↕ Sorting
    @IsOptional()
    @IsEnum(SortBy)
    sortBy?: SortBy = SortBy.CREATED_AT;

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;
}
