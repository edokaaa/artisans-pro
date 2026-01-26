// users/dto/create-client.dto.ts
import { IsString } from 'class-validator';
import { CreateProfileDto } from './create-profile.dto';

export class CreateClientDto extends CreateProfileDto {}
