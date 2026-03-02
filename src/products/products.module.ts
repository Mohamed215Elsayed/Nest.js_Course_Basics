import { Module, forwardRef } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { UsersModule } from 'src/users/users.module';


@Module({
    controllers: [ProductsController],
    providers: [ProductsService],

    imports: [TypeOrmModule.forFeature([Product]
    ),
        UsersModule,
    ],
    exports: [ProductsService]
})
export class ProductsModule { }

