import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { randomUUID } from 'crypto';

@Injectable()
export class RedisLockService {
  constructor(private readonly redisService: RedisService) {}

  async acquire(
    key: string,
    ttlMs: number,
  ): Promise<{ lockId: string } | null> {
    const client = this.redisService.getClient();
    const lockId = randomUUID();

    const result = await client.set(key, lockId, 'PX', ttlMs, 'NX');

    if (!result) return null;

    return { lockId };
  }

  async release(key: string, lockId: string): Promise<void> {
    const client = this.redisService.getClient();

    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;

    await client.eval(script, 1, key, lockId);
  }
}
