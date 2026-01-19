import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsNotEmpty()
  @IsNumber()
  APP_PORT: number;

  @IsNotEmpty()
  @IsString()
  DB_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  DB_USERNAME: string;

  @IsNotEmpty()
  @IsString()
  DB_NAME: string;

  @IsNotEmpty()
  @IsNumber()
  DB_PORT: number;

  @IsNotEmpty()
  @IsString()
  DB_HOST: string;

  @IsNotEmpty()
  @IsBoolean()
  DB_LOGGING: boolean;

  // @IsNotEmpty()
  // @IsString()
  // JWT_ACCESS_TOKEN_SECRET: string;

  // @IsNotEmpty()
  // @IsString()
  // JWT_ACCESS_TOKEN_EXPIRATION: string;

  // @IsNotEmpty()
  // @IsString()
  // JWT_REFRESH_TOKEN_SECRET: string;

  // @IsNotEmpty()
  // @IsString()
  // JWT_REFRESH_TOKEN_EXPIRATION: string;
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
