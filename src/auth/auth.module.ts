import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule } from '@nestjs/config';
import { ServiceTokenManager } from './service-token-manager';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [ConfigModule, PassportModule.register({ defaultStrategy: 'jwt' }), CommonModule],
  providers: [JwtStrategy, ServiceTokenManager],
  exports: [PassportModule, ServiceTokenManager],
})
export class AuthModule {}
