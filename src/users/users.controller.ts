import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { User } from "./user.interface";
import { UsersService } from './users.service';
import { ReviewsService } from "../reviews/reviews.service";

@Controller('api/v1/users')
export class UserController {
  constructor(private readonly usersService: UsersService,
    private readonly reviewsService: ReviewsService
  ) { }
  @Get()
  public getAllUsers(): User[] {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): User {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto): User {
    return this.usersService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() dto: UpdateUserDto): User {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(id);
  }
}



