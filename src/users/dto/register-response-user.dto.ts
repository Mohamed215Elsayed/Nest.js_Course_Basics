import { User } from "../entities/user.entity";
import {UserRole} from '../../utils/enums/user-role.enum';

export class UserResponseDto {
    id: number;
    email: string;
    username?: string;
    role: UserRole;
    isAccountVerified: boolean;
    createdAt: Date;
    profileImage: string | null;
    // verificationToken: string | null;
    // verificationTokenExpiresAt :Date;
  
    constructor(user: User) {
      this.id = user.id;
      this.email = user.email;
      this.username = user.username;
      this.role = user.role;
      this.profileImage= user.profileImage ?? '';
      this.isAccountVerified = user.isAccountVerified;
      this.createdAt = user.createdAt;
      // this.verificationToken = user.verificationToken;
      // this.verificationTokenExpiresAt = user.verificationTokenExpiresAt;
    }
  }
  