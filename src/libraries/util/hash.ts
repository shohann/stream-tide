import bcrypt from "bcrypt";
import configs from "../../configs";

const salt = configs.SALT;

export const hashPassword = async (plainPassword: string): Promise<string> => {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const compareHashedPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    const result = await bcrypt.compare(password, hashedPassword);
    return result;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};
