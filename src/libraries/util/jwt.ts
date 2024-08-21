import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import configs from "../../configs";

// ey gulo cholbe na jwt te. ey gulo redis a
const refreshExpiresIn = 60 * 60 * 24 * 7; // Should be stored in config
const accessExpiresIn = 5 * 60; // // Should be stored in config

const jwtSecret = configs.JWT_SECRET;
const jwtExpiration = configs.JWT_EXPIRATION;
const jwtRefreshSecret = configs.REFRESH_TOKEN_SECRET;

interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

interface RefreshTokenPayload {
  id: number;
  email: string;
  role: string;
  refreshTokenId: string;
}

export const generateTokenId = (userId: string) => {
  const uuid = uuidv4();

  return `${userId}:${uuid}`;
};

export const generateAccessToken = (data: TokenPayload): string => {
  try {
    const authToken = jwt.sign(
      { id: data.id, email: data.email, role: data.role },
      jwtSecret,
      {
        expiresIn: "1150m", // TODO: Need to change
      }
    );

    console.log("===================");

    console.log(authToken);

    console.log("===================");

    return authToken;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const generateRefreshToken = (data: RefreshTokenPayload): string => {
  try {
    const refreshToken = jwt.sign(
      {
        id: data.id,
        email: data.email,
        role: data.role,
        refreshTokenId: data.refreshTokenId,
      },
      jwtRefreshSecret,
      {
        expiresIn: "15m",
      }
    );
    return refreshToken;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    console.log("===================");
    console.log(token);
    console.log("===================");
    const decode = jwt.verify(token, jwtSecret) as TokenPayload;

    // console.log(decode);
    return decode;
  } catch (error) {
    console.log("________________");
    throw new Error((error as Error).message);
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const decode = jwt.verify(token, jwtRefreshSecret) as RefreshTokenPayload;
    return decode;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const getToken = (bearerToken: string): string => {
  try {
    return bearerToken.split(" ")[1];
  } catch (error) {
    throw new Error((error as Error).message);
  }
};
