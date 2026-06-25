import { config } from './config';
import Redis from 'ioredis';

class RedisClient {
  private redis: Redis | null = null;
  private static instance: RedisClient;
  private hasLoggedRedisError = false;
  private reconnectInterval: number = 10 * 60 * 1000;
  private reconnectIntervalId: NodeJS.Timeout | null = null;
  private redisExpiryTime = 600;

  private constructor() {
    const redisHost = config.redis.host;
    console.log('redisHost from config:', redisHost);
    try {
      this.redis = new Redis({ host: redisHost });
      this.redis.on('error', (error) => {
        if (!this.hasLoggedRedisError) {
          console.error('Redis error:', error);
          this.hasLoggedRedisError = true;
        }
        this.redis = null;
        this.scheduleReconnect();
      });
      this.redis.on('connect', () => {
        if (this.hasLoggedRedisError) {
          this.hasLoggedRedisError = false;
          console.info('Redis connection re-established.');
        }
        this.clearReconnect();
      });
    } catch (error) {
      if (!this.hasLoggedRedisError) {
        console.error('Failed to initialize Redis:', error);
        this.hasLoggedRedisError = true;
      }
      this.redis = null;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectIntervalId) return;
    console.info(`Scheduling reconnection to Redis every ${this.reconnectInterval / 60000} minutes.`);
    this.reconnectIntervalId = setInterval(() => {
      console.info('Attempting to reconnect to Redis...');
      this.connect();
    }, this.reconnectInterval);
  }

  private clearReconnect(): void {
    if (this.reconnectIntervalId) {
      clearInterval(this.reconnectIntervalId);
      this.reconnectIntervalId = null;
      console.info('Cleared Redis reconnection attempts.');
    }
  }

  private connect(): void {
    const redisHost = config.redis.host;
    if (!redisHost) {
      console.warn('Redis host is not configured. Falling back to localhost.');
      config.redis.host = 'localhost';
    }
    try {
      this.redis = new Redis({ host: config.redis.host });
      this.redis.on('error', (error) => {
        if (!this.hasLoggedRedisError) {
          console.error('Redis error:', error);
          this.hasLoggedRedisError = true;
        }
        this.redis = null;
      });
      this.redis.on('connect', () => {
        if (this.hasLoggedRedisError) {
          this.hasLoggedRedisError = false;
          console.info('Redis connection re-established.');
        }
        this.clearReconnect();
      });
    } catch (error) {
      if (!this.hasLoggedRedisError) {
        console.error('Failed to reconnect to Redis:', error);
        this.hasLoggedRedisError = true;
      }
      this.redis = null;
    }
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async testRedisConnection(): Promise<void> {
    if (!this.redis) {
      console.warn('Redis is unavailable. Skipping connection test.');
      return;
    }
    try {
      const result = await this.redis.ping();
      console.info(`Pinged Redis: ${result}`);
    } catch (error) {
      console.error('Redis connection error:', error);
      this.redis = null;
    }
  }

  public async setValue(key: string, value: unknown): Promise<void> {
    if (!this.redis) {
      console.warn('Cannot set value. Redis is unavailable.');
      return;
    }
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', this.redisExpiryTime);
    } catch (error) {
      console.error('Failed to set value in Redis:', error);
    }
  }

  public async setValueEx(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.redis) {
      console.warn('Cannot set value. Redis is unavailable.');
      return;
    }
    const ttl = Math.max(1, Math.floor(ttlSeconds));
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      console.error('Failed to set value in Redis (setValueEx):', error);
    }
  }

  public async incr(key: string): Promise<number | null> {
    if (!this.redis) {
      console.warn('Cannot incr key. Redis is unavailable.');
      return null;
    }
    try {
      return await this.redis.incr(key);
    } catch (error) {
      console.error('Failed to incr key in Redis:', error);
      return null;
    }
  }

  public async getValueQuiet(key: string): Promise<string | null> {
    if (!this.redis) return null;
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error('Failed to get value from Redis (quiet):', error);
      return null;
    }
  }

  public async getValue(key: string): Promise<string | null> {
    if (!this.redis) {
      console.warn('Cannot get value. Redis is unavailable.');
      return null;
    }
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error('Failed to get value from Redis:', error);
      return null;
    }
  }

  public async hasKey(key: string): Promise<boolean> {
    if (!this.redis) {
      console.warn('Cannot check key. Redis is unavailable.');
      return false;
    }
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Failed to check key in Redis:', error);
      return false;
    }
  }

  public async clearCache(): Promise<void> {
    if (!this.redis) {
      console.warn('Cannot clear cache. Redis is unavailable.');
      return;
    }
    try {
      await this.redis.flushall();
      console.info('Successfully cleared the Redis cache.');
    } catch (error) {
      console.error('Failed to clear Redis cache:', error);
    }
  }
}

export default RedisClient;
