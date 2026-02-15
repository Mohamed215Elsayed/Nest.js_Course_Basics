
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
    ) { }

    // 🔹 Get All
    async findAll(): Promise<Product[]> {
        return this.productRepo.find();
    }
 
    // 🔹 Get One
    async findOne(id: number): Promise<Product> {
        const product = await this.productRepo.findOne({
            where: { id },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

    // 🔹 Create
    async create(dto: CreateProductDto): Promise<Product> {
        const product = this.productRepo.create(dto);
        return this.productRepo.save(product);
    }

    // 🔹 Update
    async update(id: number, dto: UpdateProductDto): Promise<Product> {
        const product = await this.findOne(id);

        Object.assign(product, dto);

        return this.productRepo.save(product);
    }

    // 🔹 Delete
    async remove(id: number): Promise<void> {
        const product = await this.findOne(id);
        await this.productRepo.remove(product);
    }
}
