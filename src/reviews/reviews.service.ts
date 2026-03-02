import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryRunner } from "typeorm";
import { Review } from "./entities/review.entity";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { ProductsService } from "../products/products.service";
import { Product } from "src/products/entities/product.entity";
import { ReviewResponseDto } from "./dto/review-response.dto";
import { FilterReviewsDto } from "./dto/filter-reviews.dto";
import { UserRole } from "../utils/enums/user-role.enum";

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
        private readonly productsService: ProductsService,
    ) { }

    /**
     * 🔹 Create a new review
     * - Prevent duplicate reviews by the same user for the same product
     * - Transaction-safe
     * - Updates product ratings atomically
     * @param dto CreateReviewDto
     * @param userId ID of the current user
     * @returns ReviewResponseDto
     */
    async create(dto: CreateReviewDto, userId: number): Promise<ReviewResponseDto> {
        const queryRunner = this.reviewRepo.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 1️⃣ Check if product exists
            const product = await queryRunner.manager.findOne(Product, { where: { id: dto.productId } });
            if (!product) throw new NotFoundException("Product not found");

            // 2️⃣ Prevent duplicate review
            const existingReview = await queryRunner.manager.findOne(Review, {
                where: { user: { id: userId }, product: { id: dto.productId } },
            });
            if (existingReview) throw new ConflictException("You have already reviewed this product");

            // 3️⃣ Create review
            const review = queryRunner.manager.create(Review, {
                rating: dto.rating,
                comment: dto.comment,
                user: { id: userId },
                product: { id: dto.productId },
            });
            const savedReview = await queryRunner.manager.save(review);

            // 4️⃣ Update product rating (aggregate)
            const result = await queryRunner.manager
                .createQueryBuilder(Review, "review")
                .select("COUNT(review.id)", "count")
                .addSelect("AVG(review.rating)", "avg")
                .where("review.product_id = :productId", { productId: dto.productId })
                .getRawOne();

            product.ratingsCount = Number(result.count) || 0;
            product.averageRating = Number(result.avg) || 0;
            await queryRunner.manager.save(product);

            await queryRunner.commitTransaction();

            // 5️⃣ Return populated review
            const fullReview = await this.reviewRepo.findOne({
                where: { id: savedReview.id },
                relations: { user: true, product: true },
            });
            return new ReviewResponseDto(fullReview!);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * 🔹 Get all reviews with filters, pagination, and sorting
     * - Only fetch user id + username and product id + title
     */
    async findAll(filters: FilterReviewsDto) {
        const {
            productId,
            userId,
            minRating,
            maxRating,
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "DESC",
        } = filters;

        const query = this.reviewRepo
            .createQueryBuilder("review")
            .leftJoin("review.user", "user")
            .leftJoin("review.product", "product")
            .addSelect(["user.id", "user.username", "product.id", "product.title"])
            .where("review.deletedAt IS NULL");


        if (productId) query.andWhere("review.product_id = :productId", { productId });
        if (userId) query.andWhere("review.user_id = :userId", { userId });
        if (minRating !== undefined) query.andWhere("review.rating >= :minRating", { minRating });
        if (maxRating !== undefined) query.andWhere("review.rating <= :maxRating", { maxRating });

        query.orderBy(`review.${sortBy}`, sortOrder);
        query.skip((page - 1) * limit).take(limit);

        const [data, total] = await query.getManyAndCount();
        const totalPages = Math.ceil(total / limit);

        return {
            data: data.map((r) => new ReviewResponseDto(r)),
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }

    /**
     * 🔹 Get one review by ID
     * @param id Review ID
     */
    async findOne(id: number): Promise<ReviewResponseDto> {
        const review = await this.reviewRepo.findOne({
            where: { id },
            relations: { user: true, product: true },
        });
        if (!review) throw new NotFoundException("Review not found");
        return new ReviewResponseDto(review);
    }

    /**
     * 🔹 Update review (Owner or Admin)
     * - Only owner or admin can update
     * - Updates product rating after edit
     */
    async update(
        id: number,
        dto: UpdateReviewDto,
        userId: number,
        role: UserRole,
    ): Promise<ReviewResponseDto> {
        const review = await this.reviewRepo.findOne({
            where: { id },
            relations: { user: true, product: true },
        });
        if (!review) throw new NotFoundException("Review not found");

        const isOwner = review.user.id === userId;
        const isAdmin = role === UserRole.ADMIN;
        if (!isOwner && !isAdmin) throw new ForbiddenException("Not allowed to update this review");

        Object.assign(review, dto);
        const updated = await this.reviewRepo.save(review);
        await this.updateProductRatings(review.product.id);
        return new ReviewResponseDto(updated);
    }

    /**
     * 🔹 Soft-delete review (Owner or Admin)
     * - Only owner or admin can delete
     * - Updates product rating after deletion
     */
    async remove(
        id: number,
        userId: number,
        role: UserRole,
    ): Promise<void> {
        const review = await this.reviewRepo.findOne({
            where: { id },
            relations: { user: true, product: true },
        });

        if (!review) throw new NotFoundException('Review not found');

        const isOwner = review.user.id === userId;
        const isAdmin = role === UserRole.ADMIN;

        if (!isOwner && !isAdmin) throw new ForbiddenException('Not allowed to delete this review');

        await this.reviewRepo.softRemove(review); // ✅ soft delete
        await this.updateProductRatings(review.product.id);
    }


    /**
     * 🔹 Recalculate and update product ratings
     */
    private async updateProductRatings(productId: number) {
        const result = await this.reviewRepo
            .createQueryBuilder("review")
            .select("COUNT(review.id)", "count")
            .addSelect("AVG(review.rating)", "avg")
            .where("review.product_id = :productId AND review.deletedAt IS NULL", { productId })
            .getRawOne();

        const ratingsCount = Number(result.count) || 0;
        const averageRating = Number(result.avg) || 0;

        await this.productsService.update(productId, { ratingsCount, averageRating });
    }
}
