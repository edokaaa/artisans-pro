import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsNotEmpty()
  @IsNumber()
  PORT: number;

  @IsNotEmpty()
  @IsString()
  DB_HOST: string;

  @IsNotEmpty()
  @IsNumber()
  DB_PORT: number;

  @IsNotEmpty()
  @IsString()
  DB_USERNAME: string;

  @IsNotEmpty()
  @IsString()
  DB_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  DB_NAME: string;

  @IsNotEmpty()
  @IsBoolean()
  TYPEORM_LOGGING: boolean;

  @IsNotEmpty()
  @IsBoolean()
  TYPEORM_MIGRATIONS_RUN: boolean;

  @IsNotEmpty()
  @IsString()
  RABBITMQ_URL: string;

  @IsNotEmpty()
  @IsString()
  RABBITMQ_EXCHANGE: string;

  @IsNotEmpty()
  @IsString()
  JWT_PUBLIC_KEY_PATH: string;

  @IsNotEmpty()
  PAYMENT_SERVICE_BASE_URL: string;
}

export function validate(config: Record<string, unknown>) {
  const validateConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validateConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validateConfig;
}
