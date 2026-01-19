// users/dto/create-client.dto.ts
import { IsString } from 'class-validator';

export class CreateClientDto {
  @IsString()
  fullName: string;
}
