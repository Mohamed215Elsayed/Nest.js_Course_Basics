import { Type } from 'class-transformer';
import {
    IsOptional,
    IsNumber,
    Min,
    Max,
    IsEnum,
} from 'class-validator';

export enum ReviewSortBy {
    CREATED_AT = 'createdAt',
    RATING = 'rating',
}

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class FilterReviewsDto {
    // 🔗 Relations
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    productId?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    userId?: number;

    // ⭐ Rating Range
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(5)
    minRating?: number;


    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(5)
    maxRating?: number;

    // 📄 Pagination
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit: number = 10;

    // ↕ Sorting
    @IsOptional()
    @IsEnum(ReviewSortBy)
    sortBy?: ReviewSortBy = ReviewSortBy.CREATED_AT;

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;
}
