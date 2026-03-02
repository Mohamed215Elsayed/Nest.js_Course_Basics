import {MailerService} from "@nestjs-modules/mailer";
import {Injectable, InternalServerErrorException, Logger} from "@nestjs/common";
import {User} from "../users/entities/user.entity";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailService {
    private readonly logger : Logger = new Logger(MailService.name);
    constructor(private readonly mailerService : MailerService,
        private readonly config: ConfigService
    ) {}

    public async sendLoginNotification(user : User): Promise < void > {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                from: '"No Reply" <no-reply@example.com>',
                subject: "🔔 Login Notification",
                template: 'login',
                context: {
                    username: user.username || user.email,
                    loginTime: new Date().toLocaleString(),
                    reviewUrl: `${this.config.getOrThrow("DOMAIN")}/api/v1/users/auth/login`
                }
            });
        } catch (error) {
            this.logger.error(`Login notification email failed for ${
                user.email
            }`, error.stack,);
            throw new InternalServerErrorException("Something went wrong during login notification email",);
        }
    }
    public async sendVerifyEmailTemplate(user : User, link : string): Promise < void > {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                from: '"No Reply" <no-reply@example.com>',
                subject: "🔔Verify Your Account",
                template: 'verify-email',
                context: {
                    username: user.username || user.email,
                    link
                }
            });
        } catch (error) {
            this.logger.error(`Verification email failed for ${
                user.email
            }`, error.stack,);
            throw new InternalServerErrorException("Something went wrong during login notification email",);
        }
    }
}
