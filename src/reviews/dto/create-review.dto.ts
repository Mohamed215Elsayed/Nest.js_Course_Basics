import { IsInt, IsNotEmpty, IsString, Min, Max } from 'class-validator';
/*id- rating-comment-user-product-createdAt*/
export class CreateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsInt()
  productId: number; // which product this review belongs to
}
