import { Controller, Get } from '@nestjs/common';
import { ReviewsService } from "./reviews.service";
// import { UsersService } from "../users/users.service";

@Controller('api/v1/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService,
    // private readonly usersService: UsersService
  ) { }//Dependency Injection
  @Get()
  public getAllReviews() {
    return this.reviewsService.findAll();
  }
}
