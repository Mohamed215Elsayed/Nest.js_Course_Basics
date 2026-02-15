import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { UsersService } from "../users/users.service";

@Injectable()
export class ReviewsService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService) { }
    private reviews = [
        { id: 1, Rating: 4, Comment: 'very good' },
        { id: 2, Rating: 4.2, Comment: 'very Good' },
        { id: 3, Rating: 3.5, Comment: 'very Good' },
        { id: 4, Rating: 5, Comment: 'very Good' },
    ];
    private nextId = 5;
    /**
     * 
     * @returns Get ALL Reviews
     */
    //   Product[] 
    findAll() {
        return [...this.reviews];
    }
}