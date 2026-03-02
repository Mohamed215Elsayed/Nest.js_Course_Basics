import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ProductsModule } from '../products/products.module';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';


@Module({
    controllers: [ReviewsController],
    providers: [ReviewsService],
    imports: [
        TypeOrmModule.forFeature([Review]),
        UsersModule,
        ProductsModule,
    ],
    // exports: [ReviewsService]
})

export class ReviewsModule { }
