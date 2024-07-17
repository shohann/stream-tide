import userSchema, { User, SelectUser } from "./schema";
import db from "../../services/database-service";
import {
  CreatedUser,
  ListedUser,
  UserSelectedFields,
  UserDetail,
  UserDetailsResponseDTO,
} from "./type";
import { eq, sql } from "drizzle-orm";
import postgres from "postgres";

export const createUser = async (data: User): Promise<CreatedUser> => {
  const [user] = await db
    .insert(userSchema)
    .values({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      userName: data.userName,
    })
    .returning();

  return user;
};

const getUserSelectedFields = (select?: Partial<UserSelectedFields>) => {
  const selectedFields: Partial<Record<keyof SelectUser, any>> = {};

  const keys = Object.keys(userSchema) as (keyof SelectUser)[];

  if (!select || Object.keys(select).length === 0) {
    // If no select object is provided or it is empty, select all fields
    keys.forEach((key) => {
      selectedFields[key] = userSchema[key];
    });
  } else {
    // If select object is provided, select only fields marked as true
    keys.forEach((key) => {
      if (select[key] === true) {
        selectedFields[key] = userSchema[key];
      }
    });
  }

  return selectedFields;
};

export const getUsers = async (
  select?: Partial<UserSelectedFields>
): Promise<ListedUser[]> => {
  const selectedFields = getUserSelectedFields(select);

  const userList = await db.select(selectedFields).from(userSchema);

  return userList;
};

export const getUserDetails = async (
  id: number
): Promise<UserDetail | null> => {
  const details = await db
    .select()
    .from(userSchema)
    .where(eq(userSchema.id, id));

  return details[0];
};

export const checkUserExistanceById = async (id: number) => {
  const isUserExist =
    await sql`select exists (select 1 from ${userSchema} where ${userSchema.id} = ${id})`;
  const result: postgres.RowList<Record<string, unknown>[]> = await db.execute(
    isUserExist
  );

  return result[0].exists;
};
