import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './users.controller';
import { UsersService } from './users.service';
import { ReviewsModule } from 'src/reviews/reviews.module';
@Module({
    controllers: [UserController], providers: [UsersService]
    , exports: [UsersService],
    imports: [forwardRef(() => ReviewsModule)]//circular DI
})
export class UsersModule {

}
