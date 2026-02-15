import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { User } from "./user.interface";
import { ReviewsService } from 'src/reviews/reviews.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => ReviewsService))
    private readonly reviewsService: ReviewsService
  ) { }
  private users: User[] = [
    { id: 1, name: "Mo", email: 'moeid2152000@gmail.com' },
    { id: 2, name: "Mo", email: 'moeid433@gmail.com' },];
  private nextId = 3;

  findAll(): User[] {
    return [...this.users];
  }

  findOne(id: number): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    return { ...user };
  }

  create(dto: CreateUserDto): User {
    const newUser: User = {
      id: this.nextId++,
      ...dto,
    };

    this.users.push(newUser);
    return newUser;
  }

  update(id: number, dto: UpdateUserDto): User {
    const user = this.findOne(id);

    const updated: User = { ...user, ...dto };

    const index = this.users.findIndex((u) => u.id === id);
    this.users[index] = updated;

    return updated;
  }

  remove(id: number): User {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new NotFoundException('User not found');

    const [deleted] = this.users.splice(index, 1);
    return deleted;
  }
}
