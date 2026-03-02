import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Review } from '../../reviews/entities/review.entity';
import { User } from "../../users/entities/user.entity";

@Entity({ name: 'products' })
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column('decimal', {
        precision: 10,
        scale: 2,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        },
    })
    price: number;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
    averageRating: number;

    @Column({ type: 'int', default: 0 })
    ratingsCount: number;

    @OneToMany(() => Review, (review) => review.product,
        // {eager:true}
    )
    reviews: Review[];

    @ManyToOne(() => User, (user) => user.products, {
        onDelete: 'CASCADE',
        nullable: false,
        // eager:true
    }
    )
    @JoinColumn({ name: 'user_id' })
    user: User;

    @CreateDateColumn({ type: 'timestamptz', precision: 6, name: 'created_at', })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', precision: 6, name: 'updated_at', })
    updatedAt: Date;

}
/*
id
title
description
price
averageRating
ratingsCount
reviews
user
createdAt
updatedAt
*/
/*
title
description
price
*/
/*
| العمود        | يتحط في Create DTO؟ | ليه                        |
| ------------- | ------------------- | -------------------------- |
| id            | ❌ لا                | بيتولد أوتوماتيك           |
| createdAt     | ❌ لا                | بيتولد تلقائي              |
| updatedAt     | ❌ لا                | بيتولد تلقائي              |
| reviews       | ❌ لا                | relation                   |
| averageRating | ❌ لا                | بيتحسب من الريفيوز         |
| ratingsCount  | ❌ لا                | بيتحسب من الريفيوز         |
| user          | ⚠️ أيوه غالبًا      | لازم نحدد المنتج تابع لمين |

*/