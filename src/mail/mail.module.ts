import {MailerModule} from "@nestjs-modules/mailer";
import {Module} from "@nestjs/common";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {MailService} from "./mail.service";
import {join} from "path";
import { EjsAdapter } from "@nestjs-modules/mailer/dist/adapters/ejs.adapter";

@Module({
    imports: [
        MailerModule.forRootAsync(
            {
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService : ConfigService) => (
                    {
                        transport: {
                            host: configService.get('SMTP_HOST'),
                            port: Number(configService.get('SMTP_PORT')),
                            secure: false,
                            auth: {
                                user: configService.get('SMTP_USERNAME'),
                                pass: configService.get('SMTP_PASSWORD')
                            }
                        },
                        template: {
                            // dir: join(__dirname, 'templates'),
                            dir: join(process.cwd(), 'src/mail/templates'),
                            adapter: new EjsAdapter({
                                inlineCssEnabled: true
                            }),
                            options: {
                                strict: true
                            }
                        }
                    }
                )
            }
        ),
    ],
    controllers: [],
    providers: [MailService],
    exports: [MailService]
})
export class MailModule {}
