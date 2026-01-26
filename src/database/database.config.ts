import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get('DB_HOST'),
  port: Number(config.get('DB_PORT')),
  username: config.get('DB_USERNAME'),
  password: config.get('DB_PASSWORD'),
  database: config.get('DB_NAME'),

  ssl: config.get('DB_SSL', false) === 'true' ? { rejectUnauthorized: false } : false,

  autoLoadEntities: true,

  synchronize: false,
  logging: config.get('TYPEORM_LOGGING') === 'true',

  migrationsRun: config.get('TYPEORM_MIGRATIONS_RUN') === 'true',
  migrations: ['dist/database/migrations/*.js'],

  // PostGIS support
  extra: {
    application_name: 'pro-service-api',
  },
});
