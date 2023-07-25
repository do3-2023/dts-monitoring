import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Hello {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  message: string;
}