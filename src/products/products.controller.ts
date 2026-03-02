import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Query,
  // ParseFloatPipe
  // UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { UserRole } from '../utils/enums/user-role.enum';
import { Protected } from '../users/guards/protected.decorator';
import { FilterProductsDto } from './dto/filter-products.dto';
import { PaginatedResponse } from '../utils/interfaces/paginated-response.interface';
// import { AuthGuard } from '../users/guards/auth.guard';
// import { RolesGuard } from '../users/guards/roles.guard';
// import { AdminOnly } from 'src/users/guards/AdminOnly.guard';
// import { Roles } from '../users/decorators/roles.decorator';

@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  /**
   * GET /api/v1/products
   * ----------------------------------------
   * Retrieves a list of all products.
   *
   * Public endpoint.
   */
  // @Get()
  // @HttpCode(HttpStatus.OK) // 200
  // async findAll(
  //   @Query('title') title?: string,
  //   @Query('minPrice') minPrice?: number,
  //   @Query('maxPrice') maxPrice?: number,
  // ): Promise<Product[]> {

  //   return this.productsService.findAll(
  //     title,
  //     minPrice ? Number(minPrice) : undefined,
  //     maxPrice ? Number(maxPrice) : undefined,
  //   );
  // }

  // @Get()
  // @HttpCode(HttpStatus.OK)
  // async findAll(
  //   @Query('title') title?: string,
  //   @Query('minPrice', ParseFloatPipe) minPrice?: number,
  //   @Query('maxPrice', ParseFloatPipe) maxPrice?: number,
  // ): Promise<Product[]> {

  //   return this.productsService.findAll(title, minPrice, maxPrice);
  // }
  // @Get()
  // @HttpCode(HttpStatus.OK)
  // async findAll(@Query() filters: FilterProductsDto) {
  //   return this.productsService.findAll(
  //     filters.title,
  //     filters.minPrice,
  //     filters.maxPrice,
  //   );
  // }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() filters: FilterProductsDto,
  ): Promise<PaginatedResponse<Product>> {
    return this.productsService.findAll(filters);
  }


  /**
   * GET /api/v1/products/:id
   * ----------------------------------------
   * Retrieves a single product by its ID.
   *
   * Public endpoint.
   *
   * @param id Product ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK) // 200
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  /**
   * POST /api/v1/products
   * ----------------------------------------
   * Creates a new product.
   *
   * 🔐 Access: Admin only
   *
   * @param dto CreateProductDto
   * @param userId Extracted from JWT payload (sub)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED) // 201
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // @AdminOnly()
  @Protected(UserRole.ADMIN)
  async create(
    @Body() dto: CreateProductDto,
    @CurrentUser('sub') userId: number,
  ): Promise<Product> {
    return this.productsService.create(dto, userId);
  }

  /**
   * PATCH /api/v1/products/:id
   * ----------------------------------------
   * Updates an existing product.
   *
   * 🔐 Access: Admin only
   *
   * @param id Product ID
   * @param dto UpdateProductDto
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK) // 200
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // @AdminOnly()
  @Protected(UserRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, dto);
  }

  /**
   * DELETE /api/v1/products/:id
   * ----------------------------------------
   * Deletes a product by ID.
   *
   * 🔐 Access: Admin only
   *
   * @param id Product ID
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204
  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // @AdminOnly()
  @Protected(UserRole.ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.productsService.remove(id);
  }
}

