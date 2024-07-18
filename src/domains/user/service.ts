import { AppError } from "../../libraries/error-handling/AppError";
import {
  CreateRequestDTO,
  CreateResponseDTO,
  loginRequestDTO,
  loginResponseDTO,
  UserDetailsResponseDTO,
} from "./type";
import * as repository from "./repository";
import { UserSelectedFields } from "./type";
import { generateAccessToken } from "../../libraries/util/jwt";
import {
  generateHashedPassword,
  compareHashedPassword,
} from "../../libraries/util/hash";

const model = "User";

export const login = async (
  data: loginRequestDTO
): Promise<loginResponseDTO> => {
  try {
    const existingUserWithEmail = await repository.getUserDetailsByEmail(
      data.email
    );

    if (!existingUserWithEmail) {
      throw new AppError(
        `${model}: Invalid email or password`,
        `${model}: Invalid email or password`,
        401
      );
    }

    const currentPassword = existingUserWithEmail.password;
    const incomingPassword = data.password;

    const compareResult = await compareHashedPassword(
      incomingPassword,
      currentPassword
    );

    if (!compareResult) {
      throw new AppError(
        `${model}: Invalid email or password`,
        `${model}: Invalid email or password`,
        401
      );
    }

    const accessToken = await generateAccessToken({
      id: existingUserWithEmail.id,
      email: existingUserWithEmail.email,
      role: "user",
    });

    return {
      id: existingUserWithEmail.id,
      accessToken: accessToken,
    };
  } catch (error) {
    throw error;
  }
};

export const register = async (
  data: CreateRequestDTO
): Promise<CreateResponseDTO> => {
  try {
    const existingUserWithEmail = await repository.checkUserExistanceByEmail(
      data.email
    );
    if (existingUserWithEmail === true) {
      throw new AppError(
        `${model} already exist with this email`,
        `${model} already exist with this email`,
        409
      );
    }

    const existingUserWithUserName =
      await repository.checkUserExistanceByUseName(data.userName);
    if (existingUserWithUserName === true) {
      throw new AppError(
        `${model} already exist with this username`,
        `${model} already exist with this username`,
        409
      );
    }

    const hashedPassword = await generateHashedPassword(data.password);

    const user = await repository.createUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      userName: data.userName,
    });

    const accessToken = await generateAccessToken({
      id: user.id,
      email: user.email,
      role: "user",
    });

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      email: user.email,
      accessToken,
    };
  } catch (error: any) {
    console.error(`create(): Failed to create ${model}`, error);
    throw error;
  }
};

export const list = async () => {
  const userSelects: Partial<UserSelectedFields> = {
    id: true,
    firstName: true,
    lastName: true,
    createdAt: false,
  };
  const userList = await repository.getUsers(userSelects);

  return userList;
};

export const details = async (id: number): Promise<UserDetailsResponseDTO> => {
  const details = await repository.getUserDetails(id);

  if (!details) {
    throw new Error("Not found");
  }

  const finalDetails: UserDetailsResponseDTO = {
    id: details.id,
    firstName: details.firstName,
    lastName: details.lastName,
    email: details.email,
    userName: details.userName,
    image: details.userName,
    createdAt: details.createdAt,
  };

  return finalDetails;
};
