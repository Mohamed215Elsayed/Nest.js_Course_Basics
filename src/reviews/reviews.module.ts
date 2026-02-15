import { Module, forwardRef } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
// import { ProductsModule } from 'src/products/products.module';
import { UsersModule } from 'src/users/users.module';
@Module({
    controllers: [ReviewsController],
    providers: [ReviewsService],
    imports: [forwardRef(() => UsersModule)],//circular DI
    exports: [ReviewsService]
})

export class ReviewsModule { }
