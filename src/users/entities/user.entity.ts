import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    DeleteDateColumn,
    BeforeInsert,
    OneToMany,
    BeforeUpdate,
} from 'typeorm';

import { UserRole } from '../../utils/enums/user-role.enum';
// import * as bcrypt from 'bcrypt';
import * as argon2 from 'argon2';
import { Product } from '../../products/entities/product.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 150,
        nullable: true,
    })
    username?: string;

    @Index()
    // @Index({ unique: true })
    @Column({ type: 'varchar', length: 150, unique: true })
    email: string;

    @Column({ select: false })
    @Exclude()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @Column({ default: false })
    isAccountVerified: boolean;

    @OneToMany(() => Product, (product) => product.user,)
    products: Product[];

    @OneToMany(() => Review, (review) => review.user)
    reviews: Review[];

    @CreateDateColumn({
        type: 'timestamptz',
        precision: 6,
        name: 'created_at',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamptz',
        precision: 6,
        name: 'updated_at',
    })
    updatedAt: Date;

    @DeleteDateColumn({
        type: 'timestamptz',
        nullable: true,
    })
    deletedAt?: Date;
    //     @BeforeInsert()
    //     async hashPassword() {
    //         this.password = await bcrypt.hash(this.password, 10);
    //     }
    //     @BeforeUpdate()
    // async hashPasswordOnUpdate() {
    //     if (this.password && !this.password.startsWith('$2b$')) {//كده مش هيعيد تشفير hashed password.
    //         this.password = await bcrypt.hash(this.password, 10);
    //     }
    // }
    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            this.password = await argon2.hash(this.password);
        }
    }

    @BeforeUpdate()
    async hashPasswordOnUpdate() {
        if (this.password && !this.password.startsWith('$argon2')) {
            this.password = await argon2.hash(this.password);
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    normalizeEmail() {
        if (this.email) {
            this.email = this.email.toLowerCase();
        }
    }


}

