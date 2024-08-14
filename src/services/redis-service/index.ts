import { createClient, RedisClientType } from "redis";

class RedisService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      url: "redis://localhost:6379", // You can add Redis configuration options here
    });

    this.client.connect().catch(console.error);

    this.client.on("error", (error) => {
      console.error("Redis Client Error:", error);
    });

    this.client.on("connect", () => {
      console.log("Redis Client Connected");
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error("Redis GET error:", error);
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
      console.error("Redis SET error:", error);
      throw error;
    }
  }

  async delete(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      console.error("Redis DELETE error:", error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return (await this.client.exists(key)) > 0;
    } catch (error) {
      console.error("Redis EXISTS error:", error);
      throw error;
    }
  }

  async increment(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error("Redis INCREMENT error:", error);
      throw error;
    }
  }

  async decrement(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      console.error("Redis DECREMENT error:", error);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return Boolean(result);
    } catch (error) {
      console.error("Redis EXPIRE error:", error);
      throw error;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error("Redis TTL error:", error);
      throw error;
    }
  }

  async flushAll(): Promise<void> {
    try {
      await this.client.flushAll();
    } catch (error) {
      console.error("Redis FLUSHALL error:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      console.log("Redis Client Disconnected");
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
      console.error("Redis disconnect error:", error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.client.isReady;
  }
}

export const redisService = new RedisService();
