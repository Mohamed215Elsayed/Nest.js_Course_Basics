import { Injectable, UnauthorizedException, InternalServerErrorException, ConflictException, Logger } from "@nestjs/common";
import { UserResponseDto } from "./dto/register-response-user.dto";
import { QueryFailedError, Repository } from "typeorm";
import { UsersService } from "./users.service";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtPayload } from "./interfaces/jwt-payload.interface";
import { User } from "./entities/user.entity";
import { RegisterUserDto } from "./dto/register-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import * as argon2 from 'argon2';
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthProvider {
    private readonly logger: Logger = new Logger(UsersService.name);
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private jwtService:JwtService
    ) { }

    /**
 * Generates JWT access token for authenticated user
 */
    private async generateToken(user: User): Promise<string> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        return this.jwtService.signAsync(payload);
    }

    /**
     * Registers a new user in the system.
     *
     * Pseudo Flow:
     * 1️⃣ Validate email uniqueness (application level check)
     * 2️⃣ Create entity instance
     * 3️⃣ Save to database
     * 4️⃣ Handle unique constraint race condition
     * 5️⃣ Return safe response DTO
     */
    public async register(
        registerDto: RegisterUserDto,
    ): Promise<{ message: string; accessToken: string; user: UserResponseDto }> {
        registerDto.email = registerDto.email.toLowerCase();
        const { email } = registerDto;

        // 1️⃣ Pre-check (fast fail for better UX)
        const exists = await this.userRepository.exists({
            where: { email },
        });

        if (exists) {
            this.logger.warn(`Register attempt with existing email: ${email}`);
            throw new ConflictException('Email already exists');
        }

        try {
            // 2️⃣ Create entity instance
            const user = this.userRepository.create(registerDto);

            // 3️⃣ Persist user
            const savedUser = await this.userRepository.save(user);
            // 🔥 Logging success
            this.logger.log(`New user registered: ${savedUser.email}`);
            // Generate token after successful registration
            const accessToken = await this.generateToken(savedUser);
            // 4️⃣ Return safe DTO
            return {
                message: 'User registered successfully',
                accessToken,
                user: new UserResponseDto(savedUser),
            };
        } catch (error) {
            /**
             * 5️⃣ Handle race condition
             * If two requests passed the exists() check simultaneously,
             * the database unique constraint will throw error code 23505
             */
            if (
                error instanceof QueryFailedError &&
                (error as any).driverError?.code === '23505'
            ) {
                this.logger.warn(`Race condition detected for email: ${email}`);
                throw new ConflictException('Email already exists');
            }

            // Unexpected error
            this.logger.error(
                `Unexpected error during registration for ${email}`,
                error.stack,
            );

            throw new InternalServerErrorException(
                'Something went wrong while registering user',
            );
        }
    }
    public async login(
        loginDto: LoginUserDto,
    )
        : Promise<{ message: string; accessToken: string; user: UserResponseDto }> {
        loginDto.email = loginDto.email.toLowerCase();
        const { email, password } = loginDto;
        try {
            // 1️⃣ Find user + explicitly select password
            const user = await this.userRepository
                .createQueryBuilder('user')
                .addSelect('user.password')
                .where('user.email = :email', { email })//:email-parameter placeholder;{ email:email } parameter binding to prevent sql injection
                .getOne();

            if (!user) {
                this.logger.warn(`Login attempt with non-existing email: ${email}`);
                throw new UnauthorizedException('Invalid credentials');
            }
            // 2️⃣ Compare password
            // const isPasswordValid = await bcrypt.compare(password, user.password);
            // مع argon2
            const isPasswordValid = await argon2.verify(user.password, password);
            if (!isPasswordValid) {
                this.logger.warn(`Invalid password attempt for: ${email}`);
                throw new UnauthorizedException('Invalid credentials');
            }
            this.logger.log(`User logged in successfully: ${email}`);
            // Generate token after successful registration
            const accessToken = await this.generateToken(user);
            // 3️⃣ Return safe DTO (never return entity directly)
            return {
                message: 'Login successful',
                accessToken,
                user: new UserResponseDto(user),
            };
        }
        catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            this.logger.error(
                `Unexpected error during login for ${email}`,
                error.stack,
            );
            throw new InternalServerErrorException(
                'Something went wrong during login',
            );
        }
    }
}