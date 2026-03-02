import {
    Injectable,
    UnauthorizedException,
    InternalServerErrorException,
    ConflictException,
    Logger,
} from "@nestjs/common";
import { UserResponseDto } from "./dto/register-response-user.dto";
import { QueryFailedError, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtPayload } from "./interfaces/jwt-payload.interface";
import { User } from "./entities/user.entity";
import { RegisterUserDto } from "./dto/register-user.dto";
import { LoginUserDto } from "./dto/login-user.dto";
import * as argon2 from 'argon2';
import { JwtService } from "@nestjs/jwt";
import { MailService } from "../mail/mail.service";
import { randomBytes } from 'crypto';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthProvider {
    private readonly logger = new Logger(AuthProvider.name);
    
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly config: ConfigService
    ) {}

    /* Generates JWT access token for authenticated user */
    private async generateToken(user: User): Promise<string> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role
        };
        return this.jwtService.signAsync(payload);
    }

    /**
     * Registers a new user in the system.
     */
    public async register(registerDto: RegisterUserDto): Promise<{
        message: string;
    }> {
        registerDto.email = registerDto.email.toLowerCase();
        const { email } = registerDto;
        const exists = await this.userRepository.exists({
            where: { email }
        });
        if (exists) {
            this.logger.warn(`Register attempt with existing email: ${email}`);
            throw new ConflictException('Email already exists');
        }
        try {
            const user = this.userRepository.create(registerDto);
            const rawToken = randomBytes(32).toString('hex');
            user.verificationToken = await argon2.hash(rawToken);
            user.verificationTokenExpiresAt = new Date(Date.now() + 3600 * 1000); // 1 hr

            const savedUser = await this.userRepository.save(user);
            const link = this.generateLink(savedUser.id, rawToken);
            await this.mailService.sendVerifyEmailTemplate(savedUser, link);

            this.logger.log(`New user registered: ${savedUser.email}`);
            return { message: 'Please verify your email to activate your account' };
        } catch (error) {
            if (error instanceof QueryFailedError && (error as any).driverError?.code === '23505') {
                this.logger.warn(`Race condition detected for email: ${email}`);
                throw new ConflictException('Email already exists');
            }
            this.logger.error(`Unexpected error during registration for ${email}`, error.stack);
            throw new InternalServerErrorException('Something went wrong while registering user');
        }
    }

    public async login(loginDto: LoginUserDto): Promise<{
        message: string;
        accessToken?: string;
        user?: UserResponseDto;
    }> {
        loginDto.email = loginDto.email.toLowerCase();
        const { email, password } = loginDto;
        
        try {
            const user = await this.userRepository
                .createQueryBuilder('user')
                .addSelect('user.password')
                .addSelect('user.verificationToken')
                .addSelect('user.verificationTokenExpiresAt')
                .where('user.email = :email', { email })
                .getOne();
                
            if (!user) {
                this.logger.warn(`Login attempt with non-existing email: ${email}`);
                throw new UnauthorizedException('Invalid credentials');
            }

            const isPasswordValid = await argon2.verify(user.password, password);
            if (!isPasswordValid) {
                this.logger.warn(`Invalid password attempt for: ${email}`);
                throw new UnauthorizedException('Invalid credentials');
            }

            // ✅ التحقق من حالة الحساب
            if (!user.isAccountVerified) {
                // التحقق إذا كان التوكن لسه صالح
                if (
                    user.verificationTokenExpiresAt &&
                    user.verificationToken &&
                    user.verificationTokenExpiresAt.getTime() > Date.now()
                ) {
                    // التوكن لسه صالح - نبعت نفس الرابط
                    const link = this.generateLink(user.id, user.verificationToken);
                    await this.mailService.sendVerifyEmailTemplate(user, link);
                    return { 
                        message: 'Account not verified. A new verification email has been sent to your email address.' 
                    };
                }

                // التوكن انتهى أو مش موجود - نعمل توكن جديد
                const rawToken = randomBytes(32).toString('hex');
                const hashedToken = await argon2.hash(rawToken);
                
                // تحديث التوكن وتاريخ الانتهاء
                user.verificationToken = hashedToken;
                user.verificationTokenExpiresAt = new Date(Date.now() + 3600 * 1000); // 1 hr
                
                await this.userRepository.save(user);
                
                // إرسال التوكن الجديد
                const link = this.generateLink(user.id, rawToken);
                await this.mailService.sendVerifyEmailTemplate(user, link);
                
                return { 
                    message: 'Account not verified. A new verification link has been sent to your email address.' 
                };
            }

            // ✅ حساب مُفعل - نكمل تسجيل دخول
            this.logger.log(`User logged in successfully: ${email}`);
            
            // إرسال إشعار الدخول (في الخلفية)
            this.mailService.sendLoginNotification(user).catch(err => {
                this.logger.error(`Login email failed for ${user.email}`, err.stack);
            });

            const accessToken = await this.generateToken(user);
            
            return {
                message: 'Login successful',
                accessToken,
                user: new UserResponseDto(user)
            };
            
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            this.logger.error(`Unexpected error during login for ${email}`, error.stack);
            throw new InternalServerErrorException('Something went wrong during login');
        }
    }
    /*===============================*/
    private generateLink(userId: number, verificationToken: string): string {
        return `${this.config.getOrThrow("DOMAIN")}/api/v1/users/verify-email/${userId}/${verificationToken}`;
    }
    /*===============================*/
}