import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    Check,
    RelationId,
    OneToMany,
    Unique,
    DeleteDateColumn
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from "../../users/entities/user.entity";

@Check(`"rating" >= 1 AND "rating" <= 5`)
@Unique(['user', 'product'])
@Entity({ name: 'reviews' })
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    rating: number;

    @Column()
    comment: string;

    @Index(['user', 'createdAt'])
    @ManyToOne(() => User, (user) => user.reviews, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'user_id' })
    user: User;
    @RelationId((review: Review) => review.user)
    userId: number;

    @Index()
    @ManyToOne(() => Product, (product) => product.reviews, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'product_id' })
    product: Product;
    @RelationId((review: Review) => review.product)
    productId: number;

    @CreateDateColumn({ type: 'timestamptz', precision: 6, name: 'created_at', })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', precision: 6, name: 'updated_at', })
    updatedAt: Date;

    // ✅ Soft Delete Column
    @DeleteDateColumn({ type: 'timestamptz', precision: 6, name: 'deleted_at', nullable: true })
    deletedAt?: Date;

}
/*id- rating-comment-user-product-createdAt*/