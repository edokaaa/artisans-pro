import { IsString } from 'class-validator';

export class ReviewReplyDto {
  @IsString()
  comment: string;
}
