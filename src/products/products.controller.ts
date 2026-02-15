import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('api/v1/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }//Dependency Injection
  // private productsService = new ProductsService();

  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
/*-------------------------------*/
// import { Controller, Get, Param, ParseIntPipe, NotFoundException, Post, Body, Put, Delete,
//   // ValidationPipe,
//   //  Req, Res,Headers
//    } from '@nestjs/common';
// // import type { Request, Response } from 'express';//express request and response types
// import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';

// @Controller('api/v1/products')
// export class ProductsController {
//   private products = [
//     { id: 1, title: 'book', price: 45 },
//     { id: 2, title: 'pen', price: 10 },
//     { id: 3, title: 'bag', price: 200 },
//     { id: 4, title: 'notebook', price: 10 },
//   ];
//   // ✅ GET ALL
//   @Get()
//   public getAllProducts() {
//     return this.products;
//   }
//   // ✅ GET ONE
//   @Get(':id')
//   getProductById(@Param('id', ParseIntPipe) id: number) {
//     const product = this.products.find((p) => p.id === id);
//     if (!product) {
//       throw new NotFoundException('Product not found');//NotFoundException(message,{status:HttpStatus.NOT_FOUND,response:null,headers:null,description:null})
//     }
//     return product;
//   }
//   // ✅ CREATE
//   @Post()
//   // createProduct(@Body( new ValidationPipe({ whitelist:true,forbidNonWhitelisted:true})) body: CreateProductDto) {
//     createProduct(@Body( ) body: CreateProductDto) {
//     console.log(body)
//     const newProduct = {
//       id: this.products.length + 1,
//       title: body.title,
//       price: body.price,
//     };
//     this.products.push(newProduct);
//     return newProduct;
//   }
//   // // ✅ CREATE By express request and response
//   // @Post("/express")
//   // createProductByExpress(@Req() req: Request, @Res({ passthrough: true }) res: Response,@Headers("Authorization") authorization: string) {//passthrough:true means that the response will be passed through to the next middleware
//   //   const newProduct = {
//   //     id: this.products.length + 1,
//   //     title: req.body.title,
//   //     price: req.body.price,
//   //   };
//   //   this.products.push(newProduct);
//   //   res.status(201).json(newProduct);
//   //   // console.log(authorization);
//   //   // res.cookie("product", newProduct.id, { httpOnly: true, secure: true, maxAge: 1000 * 60 * 60 * 24 * 30 });
//   //   return newProduct;
//   // }
//   // ✅ UPDATE
//   @Put(':id')
//   updateProduct(
//     @Param('id', ParseIntPipe) id: number,
//     @Body( ) body: UpdateProductDto,
//   ) {
//     const product = this.products.find((p) => p.id === id);

//     if (!product) {
//       throw new NotFoundException('Product not found');
//     }
//     product.title = body.title ?? product.title;
//     product.price = body.price ?? product.price;

//     return product;
//   }
//   // ✅ DELETE
//   @Delete(':id')
//   deleteProduct(@Param('id', ParseIntPipe) id: number) {
//     const index = this.products.findIndex((p) => p.id === id);

//     if (index === -1) {
//       throw new NotFoundException('Product not found');
//     }

//     const deleted = this.products.splice(index, 1);
//     return { message: 'Deleted successfully', product: deleted[0] };
//   }
// }