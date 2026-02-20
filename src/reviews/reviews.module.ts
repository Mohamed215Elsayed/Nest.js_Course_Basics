import { Module } from '@nestjs/common';//, forwardRef
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
// import { ProductsModule } from 'src/products/products.module';
// import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
@Module({
    controllers: [ReviewsController],
    providers: [ReviewsService],
    imports: [
        // forwardRef(() => UsersModule), //circular DI
        TypeOrmModule.forFeature([Review])],
    // exports: [ReviewsService]
})

export class ReviewsModule { }
