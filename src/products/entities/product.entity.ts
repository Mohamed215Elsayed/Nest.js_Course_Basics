import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    UpdateDateColumn,
    // DeleteDateColumn
} from 'typeorm';

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

    @CreateDateColumn({ type: 'timestamptz', precision: 6, name: 'created_at', })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', precision: 6, name: 'updated_at', })
    updatedAt: Date;
    // @DeleteDateColumn({
    //     name: 'deleted_at',
    //     type: 'timestamptz',
    //     nullable: true,
    // })
    // deletedAt?: Date;
}