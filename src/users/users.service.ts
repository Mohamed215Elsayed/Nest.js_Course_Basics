import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { Repository, QueryFailedError } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserResponseDto } from './dto/register-response-user.dto';
import { Logger } from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '../utils/enums/user-role.enum';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthProvider } from './auth.provider';
import { LoginUserDto } from './dto/login-user.dto';
import { unlink } from 'fs/promises';
import { join } from 'path';


@Injectable()
export class UsersService {
  private readonly logger: Logger = new Logger(UsersService.name);
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private jwtService: JwtService, private authProvider: AuthProvider) { }
  public async register(registerDto: RegisterUserDto,): Promise<{
    /*  message: string; 
    accessToken: string; user: UserResponseDto  */
  }> {
    return this.authProvider.register(registerDto);
  }
  public async login(loginDto: LoginUserDto,): Promise<{
    message: string;
    accessToken?: string;
    user?: UserResponseDto
  }> {
    return this.authProvider.login(loginDto);
  }
  public async getCurrentUser(id: number): Promise<UserResponseDto> {
    if (!id) {
      throw new UnauthorizedException();
    }
    const user = await this.userRepository.findOne(
      {
        where: {
          id
        }
      }
    );
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return new UserResponseDto(user);
  }
  /**
 * Retrieves a list of all registered users.
 *
 * This endpoint returns a collection of users
 * excluding sensitive fields such as passwords.
 *
 * @returns {Promise<UserResponseDto[]>}
 */
  public async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    // const users = await this.userRepository.find({
    // select: ['id', 'username', 'email', 'role', 'createdAt'],
    // });
    return users.map(user => new UserResponseDto(user));
  }
  /**
* Updates user data.
*
* Rules:
* - User can update his own account.
* - Admin can update any user.
* - Email must be unique.
* - Password will be re-hashed if updated.
*/
  public async update(targetUserId: number, updateDto: UpdateUserDto, currentUser: JwtPayload,): Promise<{
    user: UserResponseDto;
    accessToken?: string
  }> {

    const user = await this.userRepository.findOne(
      {
        where: {
          id: targetUserId
        }
      }
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOwner = currentUser.sub === targetUserId;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new UnauthorizedException('You are not allowed to update this user',);
    }

    if (updateDto.email) {
      updateDto.email = updateDto.email.trim().toLowerCase();
    }

    if (!updateDto.password) {
      delete updateDto.password;
    }

    Object.assign(user, updateDto);

    try {
      const updatedUser = await this.userRepository.save(user);

      let newToken: string | undefined;

      if (updateDto.email) {
        newToken = await this.generateToken(updatedUser);
      }

      return { user: new UserResponseDto(updatedUser), accessToken: newToken };

    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).driverError?.code === '23505') {
        throw new ConflictException('Email already exists');
      }

      this.logger.error(`Unexpected error while updating user ${targetUserId}`, error.stack,);

      throw new InternalServerErrorException('Something went wrong while updating user',);
    }
  }
  public async delete(targetUserId: number, currentUser: JwtPayload,): Promise<{
    message: string
  }> {

    const user = await this.userRepository.findOne(
      {
        where: {
          id: targetUserId
        }
      }
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOwner = currentUser.sub === targetUserId;
    const isAdmin = currentUser.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new UnauthorizedException('You are not allowed to delete this user',);
    }

    await this.userRepository.softRemove(user);

    return { message: 'User deleted successfully' };
  }
  /******************/
  public async updateProfileImage(userId: number, filename: string,): Promise<{
    message: string;
    imageUrl: string
  }> {
    const user = await this.findUserOrFail(userId);
    // Delete old image if exists
    if (user.profileImage)
      await this.deleteImageIfExists(user.profileImage);

    user.profileImage = filename;
    await this.userRepository.save(user);
    return { message: 'Profile image uploaded successfully', imageUrl: `/uploads/users/${filename}` };
  }
  /*====================*/
  public async removeProfileImage(userId: number,): Promise<{
    message: string
  }> {
    const user = await this.findUserOrFail(userId);
    if (!user.profileImage) {
      throw new BadRequestException('User does not have a profile image');
    }
    // 🔥 reuse هنا
    await this.deleteImageIfExists(user.profileImage);
    user.profileImage = null;
    await this.userRepository.save(user);

    return { message: 'Profile image removed successfully' };
  }
  public async verifyEmail(userId: number, verificationToken: string) {
    const user = await this.userRepository.findOne({
        where: { id: userId },
        select: [
            'id',
            'email',
            'isAccountVerified',
            'verificationToken',
            'verificationTokenExpiresAt',
        ]
    });
    
    if (!user) {
        throw new NotFoundException('User not found');
    }

    if (user.isAccountVerified) {
        return {
            message: 'Account already verified',
            alreadyVerified: true
        };
    }

    if (!user.verificationToken || !user.verificationTokenExpiresAt) {
        throw new BadRequestException('No verification token found. Please request a new one.');
    }

    // ✅ التحقق من انتهاء التوكن بشكل صحيح
    if (user.verificationTokenExpiresAt.getTime() < Date.now()) {
        throw new BadRequestException('Verification link expired. Please request a new one.');
    }

    const isTokenValid = await argon2.verify(
        user.verificationToken,
        verificationToken,
    );

    if (!isTokenValid) {
        throw new BadRequestException('Invalid verification link');
    }

    user.isAccountVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiresAt = null;

    await this.userRepository.save(user);

    return {
        message: 'Your email has been verified successfully. You can now login.',
        verified: true
    };
}
  /* public async verifyEmail(userId: number, verificationToken: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId
      },
      select: [
        'id',
        'email',
        'isAccountVerified',
        'verificationToken',
        'verificationTokenExpiresAt',
      ]
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isAccountVerified) {
      throw new BadRequestException('Account already verified');
    }

    if (!user.verificationToken) {
      throw new BadRequestException('No verification token found');
    }

    if (!user.verificationTokenExpiresAt ||
      user.verificationTokenExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Verification link expired');
    }

    const isTokenValid = await argon2.verify(
      user.verificationToken,
      verificationToken,
    );

    if (!isTokenValid) {
      throw new BadRequestException('Invalid verification link');
    }

    user.isAccountVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiresAt = null;

    await this.userRepository.save(user);

    return {
      message: 'Your email has been verified successfully',
    };
  } */
  /*====================*/
  private async deleteImageIfExists(filename: string): Promise<void> {
    const filePath = join(process.cwd(), 'uploads', 'users', filename);
    try {
      await unlink(filePath);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        this.logger.warn(`Image "${filename}" not found on disk`);
      } else {
        this.logger.error(`Failed to delete image "${filename}"`, error.stack,);
      }
    }
  }
  /*=======================*/
  /**
* Generates JWT access token for authenticated user
*/
  private async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };
    return this.jwtService.signAsync(payload);
  }
  /************************/
  private async findUserOrFail(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy(
      { id: userId }
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  /************************/
}
