import { AppError } from "../../libraries/error-handling/AppError";
import db from "../../services/database-service";
import user from "./schema";

interface createUser {
  firstName: string;
  lastName: string;
}

const model = "product";

export const create = async (data: createUser) => {
  try {
    const [singleUser] = await db
      .insert(user)
      .values({
        firstName: data.firstName,
        lastName: data.lastName,
      })
      .returning();

    return singleUser;
  } catch (error: any) {
    console.error(`create(): Failed to create ${model}`, error);
    throw new AppError(`Failed to create ${model}`, error.message);
  }
};
