import { IsEmail, IsString, Length , Matches,IsOptional} from 'class-validator';
import { Transform } from 'class-transformer';

export class  RegisterUserDto {

  @Transform(({ value }) => value.trim().toLowerCase())
  // @IsEmail({}, { message: 'Invalid email format' })
  @IsEmail()
  @Length(5, 150)
  email: string;

  @IsString()
  @Length(8, 100)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).+$/, {
    message: 'Password must contain uppercase, lowercase, number and special character',
  })  
  password: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @Length(2, 150)
  username?: string;
}
