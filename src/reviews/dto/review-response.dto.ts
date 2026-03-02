
import { Review } from '../entities/review.entity';

export class ReviewResponseDto {
  id: number;
  rating: number;
  comment: string;
  user: { id: number; username?: string } | null;
  product: { id: number; title?: string } | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(review: Review) {
    this.id = review.id;
    this.rating = review.rating;
    this.comment = review.comment;
  
    this.user = review.user
      ? {
          id: review.user.id,
          username: review.user.username,
        }
      : null;
  
    this.product = review.product
      ? {
          id: review.product.id,
          title: review.product.title,
        }
      : null;
  
    this.createdAt = review.createdAt;
    this.updatedAt = review.updatedAt;
  }
  
}
