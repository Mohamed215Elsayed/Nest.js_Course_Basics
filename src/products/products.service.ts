import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Repository,
    //  ILike, LessThanOrEqual, MoreThanOrEqual, Between, FindOptionsWhere
} from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UsersService } from "../users/users.service";
import { User } from 'src/users/entities/user.entity';
import { FilterProductsDto } from './dto/filter-products.dto';
import { PaginatedResponse } from '../utils/interfaces/paginated-response.interface';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
        private readonly usersService: UsersService
    ) { }
    /* sync findAll(
        title?: string,
        minPrice?: number,
        maxPrice?: number,
    ): Promise<Product[]> {

        // const where: any = {};
        const where: FindOptionsWhere<Product> = {};
        // 🔎 Title Search
        if (title) {
            where.title = ILike(`%${title.trim()}%`);
        }
        // 💰 Price Filtering
        if (minPrice !== undefined && maxPrice !== undefined) {
            where.price = Between(minPrice, maxPrice);
        }
        else if (minPrice !== undefined) {
            where.price = MoreThanOrEqual(minPrice);
        }
        else if (maxPrice !== undefined) {
            where.price = LessThanOrEqual(maxPrice);
        }

        return this.productRepo.find({
            where,
            relations: { user: true, reviews: true },
            select: {
                id: true,
                title: true,
                price: true,
                averageRating: true,
                ratingsCount: true,
                user: {
                    id: true,
                    username: true,
                },
                reviews: {
                    id: true
                }
            },
        });
    } */

    // async findAll(filters: FilterProductsDto): Promise<PaginatedResponse<Product>> {
        async findAll(filters: FilterProductsDto) {
            const {
              title,
              minPrice,
              maxPrice,
              page = 1,
              limit = 10,
              sortBy = 'createdAt',
              sortOrder = 'DESC',
            } = filters;
          
            const query = this.productRepo
              .createQueryBuilder('product')
              .leftJoinAndSelect('product.user', 'user');
          
            if (title) {
              query.andWhere('LOWER(product.title) LIKE LOWER(:title)', {
                title: `%${title}%`,
              });
            }
          
            if (minPrice !== undefined) {
              query.andWhere('product.price >= :minPrice', { minPrice });
            }
          
            if (maxPrice !== undefined) {
              query.andWhere('product.price <= :maxPrice', { maxPrice });
            }
          
            query.orderBy(`product.${sortBy}`, sortOrder);
          
            query.skip((page - 1) * limit).take(limit);
          
            const [data, total] = await query.getManyAndCount();
          
            const totalPages = Math.ceil(total / limit);
          
            return {
              data,
              total,
              page,
              limit,
              totalPages,
              hasNextPage: page < totalPages,
              hasPreviousPage: page > 1,
            };
          }
          

    // 🔹 Get One
    async findOne(id: number): Promise<Product> {
        const product = await this.productRepo.findOne({
            where: { id },
            relations: { user: true },
            select: {
                id: true,
                title: true,
                price: true,
                averageRating: true,
                ratingsCount: true,
                user: {
                    id: true,
                    username: true,
                },
            },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }
    /**
     * create new product
     * @param 
     */
    /*  async create(dto: CreateProductDto, userId: number): Promise<Product> {
         const user = await this.usersService.getCurrentUser(userId);
         const newproduct = this.productRepo.create({
             ...dto,
             title: dto.title.trim().toLowerCase(),
             user
         });
         return this.productRepo.save(newproduct);
     } */
    async create(dto: CreateProductDto, userId: number): Promise<Product> {
        const newproduct = this.productRepo.create({
            ...dto,
            title: dto.title.trim().toLowerCase(),
            user: { id: userId } as User,
        });

        return this.productRepo.save(newproduct);
    }


    // 🔹 Update
    async update(id: number, dto: UpdateProductDto): Promise<Product> {
        // const product = await this.findOne(id);
        const product = await this.productRepo.findOne({
            where: { id },
        });
        if (!product) {
            throw new NotFoundException('Product not found');
        };
        if (dto.title) {
            dto.title = dto.title.trim().toLowerCase();
        }
        Object.assign(product, dto);
        return this.productRepo.save(product);
    }

    // 🔹 Delete
    async remove(id: number): Promise<void> {
        // const product = await this.findOne(id);
        // await this.productRepo.remove(product);
        const result = await this.productRepo.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Product not found');
        }

    }
}
