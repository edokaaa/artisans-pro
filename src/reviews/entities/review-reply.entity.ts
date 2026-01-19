import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Review } from './review.entity';

@Entity('review_replies')
export class ReviewReply extends BaseEntity {
  @OneToOne(() => Review)
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @Column('text')
  comment: string;
}
