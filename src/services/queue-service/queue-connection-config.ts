import { UrlConfig } from "../../libraries/util/parse-url";

type RedisConnectionConfig = {
  host: string;
  port: number;
  username?: string;
  password?: string;
  tls?: {
    rejectUnauthorized?: boolean;
  };
};

export const getConnectionConfig = (
  redisConfig: UrlConfig
): RedisConnectionConfig => {
  if (process.env.NODE_ENV === "production") {
    return {
      host: redisConfig.host,
      port: parseInt(redisConfig.port),
      username: redisConfig.username,
      password: redisConfig.password,
      tls: { rejectUnauthorized: true },
    };
  } else {
    return {
      host: redisConfig.host,
      port: parseInt(redisConfig.port),
    };
  }

  // return {
  //   host: redisConfig.host,
  //   port: parseInt(redisConfig.port),
  // };
};
