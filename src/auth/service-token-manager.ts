import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/common/redis.service';

@Injectable()
export class ServiceTokenManager {
  private readonly logger = new Logger(ServiceTokenManager.name);

  private static readonly CACHE_KEY = 'proservice:auth_token';
  private static readonly TTL_SECONDS = 14 * 60; // 14 minutes

  constructor(private readonly redisService: RedisService) {}

  async getToken(): Promise<string> {
    // 1. Check Redis cache
    const cachedToken = await this.redisService.get(
      ServiceTokenManager.CACHE_KEY,
    );

    if (cachedToken) {
      return cachedToken;
    }

    // 2. Fetch from Auth Service
    const authServiceUrl = process.env.AUTH_SERVICE_URL;
    const serviceId = process.env.SERVICE_ID;
    const serviceSecret = process.env.SERVICE_SECRET;

    if (!authServiceUrl || !serviceId || !serviceSecret) {
      throw new Error('Service authentication environment variables missing');
    }

    try {
      const response = await axios.post(
        `${authServiceUrl}/api/service/token`,
        {
          service_id: serviceId,
          secret: serviceSecret,
        },
        {
          timeout: 5_000,
        },
      );

      const token = response.data?.access_token;

      if (!token) {
        throw new Error('Auth service did not return access_token');
      }

      // 3. Cache token in Redis
      await this.redisService.set(
        ServiceTokenManager.CACHE_KEY,
        token,
        ServiceTokenManager.TTL_SECONDS,
      );

      return token;
    } catch (error) {
      this.logger.error(
        'Failed to fetch service token',
        error?.response?.data || error.message,
      );
      throw error;
    }
  }
}
