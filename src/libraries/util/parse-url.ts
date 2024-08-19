export interface UrlConfig {
  username: string;
  password: string;
  host: string;
  port: string;
}

export function parseUrl(url: string): UrlConfig {
  const urlObj = new URL(url);

  const username = urlObj.username;
  const password = urlObj.password;
  const host = urlObj.hostname;
  const port = urlObj.port;

  return {
    username: username,
    password: password,
    host: host,
    port: port,
  };
}
