import jwt from "jsonwebtoken";
import configs from "../../configs";

const jwtSecret = configs.JWT_SECRET;
const jwtExpiration = configs.JWT_EXPIRATION;

interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export const generateAccessToken = (data: TokenPayload): string => {
  try {
    const authToken = jwt.sign(
      { id: data.id, email: data.email, role: data.role },
      jwtSecret,
      {
        expiresIn: jwtExpiration,
      }
    );
    return authToken;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    const decode = jwt.verify(token, jwtSecret) as TokenPayload;
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
