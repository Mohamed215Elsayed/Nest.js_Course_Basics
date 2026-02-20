import { Module, forwardRef } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';

@Module({
    controllers: [ProductsController],
    providers: [ProductsService],

    imports: [TypeOrmModule.forFeature([Product]), TypeOrmModule.forFeature([Product])]
})
export class ProductsModule { }

// import { ReviewsModule } from 'src/reviews/reviews.module';
// import { UsersModule } from 'src/users/users.module';
// ,imports:[UsersModule]