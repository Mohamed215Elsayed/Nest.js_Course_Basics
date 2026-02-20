import { Controller, Body, Post, HttpCode, HttpStatus, Get, UseGuards, Param, Patch, ParseIntPipe, Delete,
  //  UseInterceptors, ClassSerializerInterceptor 
  } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from './users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../utils/enums/user-role.enum';
import { RolesGuard } from './guards/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
// import {LoggingInterceptor} from "../utils/interceptors/logging-interceptor"

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly userService: UsersService) { }

  /**
   * POST /api/v1/users/auth/register
   * Registers a new user
   */
  @Post('auth/register')
  @HttpCode(HttpStatus.CREATED) // 201
  public register(@Body() registerDto: RegisterUserDto) {
    return this.userService.register(registerDto);
  }
  /**
   * POST /api/v1/users/auth/login
   * @param loginDto 
   * @returns 
   */
  @Post('auth/login')
  @HttpCode(HttpStatus.OK) // 200
  public login(@Body() loginDto: LoginUserDto) {
    return this.userService.login(loginDto);
  }

  /**
   * 
   * @param userId 
   * @returns user info
   */
  @Get('me')
  @UseGuards(AuthGuard)
  // @UseInterceptors(LoggingInterceptor)
  // @UseInterceptors(ClassSerializerInterceptor)// to activate hide password on specific route
  public getCurrentUser(@CurrentUser('sub') userId: number) {
    return this.userService.getCurrentUser(userId);
  }

  /**
   * 
   * @returns all users
   */
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  // @UseInterceptors(ClassSerializerInterceptor)
  public findAll() {
    return this.userService.findAll();
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  public updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userService.update(id, updateDto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  public removeUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.userService.delete(id, user);
  }
}
