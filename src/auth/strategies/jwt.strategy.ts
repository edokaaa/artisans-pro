import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const publicKeyPath = configService.getOrThrow<string>(
      'JWT_PUBLIC_KEY_PATH',
    );
    const publicKey = fs.readFileSync(publicKeyPath, 'utf-8');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: configService.get('NODE_ENV') !== 'production',
      algorithms: ['RS256'],
      secretOrKey: publicKey,
    });
  }

  validate(payload: any) {
    return {
      id: payload.sub,
      role: payload.role,
    };
  }
}
