import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  Query,
  Param,
  ParseIntPipe,
  Delete,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { FilterReviewsDto } from "./dto/filter-reviews.dto";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import { Protected } from "../users/guards/protected.decorator";
import { UserRole } from "../utils/enums/user-role.enum";
import { ReviewResponseDto } from "./dto/review-response.dto";

@Controller("api/v1/reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  /** 🔹 Create a new review */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Protected(UserRole.USER, UserRole.ADMIN)
  async create(
    @Body() dto: CreateReviewDto,
    @CurrentUser("sub") userId: number,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.create(dto, userId);
  }

  /** 🔹 Get all reviews with filters */
  @Get()
  @HttpCode(HttpStatus.OK)
  @Protected(UserRole.ADMIN)
  async findAll(@Query() filters: FilterReviewsDto) {
    return this.reviewsService.findAll(filters);
  }

  /** 🔹 Get one review by ID */
  @Get(":id")
  @Protected(UserRole.USER, UserRole.ADMIN)
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<ReviewResponseDto> {
    return this.reviewsService.findOne(id);
  }

  /** 🔹 Update review (Owner or Admin) */
  @Patch(":id")
  @Protected(UserRole.USER, UserRole.ADMIN)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
    @CurrentUser("sub") userId: number,
    @CurrentUser("role") role: UserRole,
  ) {
    return this.reviewsService.update(id, dto, userId, role);
  }

  /** 🔹 Soft-delete review (Owner or Admin) */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Protected(UserRole.USER, UserRole.ADMIN)
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser("sub") userId: number,
    @CurrentUser("role") role: UserRole,
  ): Promise<void> {
    return this.reviewsService.remove(id, userId, role);
  }
}
