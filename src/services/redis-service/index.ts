import { createClient, RedisClientType } from "redis";
import logger from "../../libraries/log/logger";
import configs from "../../configs";

class RedisService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: configs.REDIS_URL,
    });

    this.client.connect().catch(logger.error);

    this.client.on("error", (error) => {
      logger.error("Redis Client Error:", error);
    });

    this.client.on("connect", () => {
      logger.info("Redis Client Connected");
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error("Redis GET error:", error);
      throw error;
    }
  }

  async set(
    key: string,
    value: string,
    expireInSeconds?: number
  ): Promise<void> {
    try {
      if (expireInSeconds) {
        await this.client.setEx(key, expireInSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error("Redis SET error:", error);
      throw error;
    }
  }

  async delete(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      logger.error("Redis DELETE error:", error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return (await this.client.exists(key)) > 0;
    } catch (error) {
      logger.error("Redis EXISTS error:", error);
      throw error;
    }
  }

  async increment(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error("Redis INCREMENT error:", error);
      throw error;
    }
  }

  async decrement(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      logger.error("Redis DECREMENT error:", error);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return Boolean(result);
    } catch (error) {
      logger.error("Redis EXPIRE error:", error);
      throw error;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error("Redis TTL error:", error);
      throw error;
    }
  }

  async flushAll(): Promise<void> {
    try {
      await this.client.flushAll();
    } catch (error) {
      logger.error("Redis FLUSHALL error:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      logger.info("Redis Client Disconnected");
    } catch (error) {
      console.error("Redis disconnect error:", error);
      throw error;
    }
  }

  async getByPattern(key: string): Promise<string[]> {
    try {
      const result = await this.client.keys(key);

      return result;
    } catch (error) {
      logger.error("Redis disconnect error:", error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.client.isReady;
  }
}

export const redisService = new RedisService();
