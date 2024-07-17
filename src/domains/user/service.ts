import { AppError } from "../../libraries/error-handling/AppError";
import {
  CreateRequestDTO,
  CreateResponseDTO,
  UserDetailsResponseDTO,
} from "./type";
import { createUser, getUsers, getUserDetails } from "./repository";
import { UserSelectedFields } from "./type";

const model = "User";

export const create = async (
  data: CreateRequestDTO
): Promise<CreateResponseDTO> => {
  try {
    const user = await createUser({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      userName: data.userName,
    });

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      email: user.email,
    };
  } catch (error: any) {
    console.error(`create(): Failed to create ${model}`, error);
    throw new AppError(`Failed to create ${model}`, error.message);
  }
};

export const list = async () => {
  const userSelects: Partial<UserSelectedFields> = {
    id: true,
    firstName: true,
    lastName: true,
    createdAt: false,
  };
  const userList = await getUsers(userSelects);

  return userList;
};

export const details = async (id: number): Promise<UserDetailsResponseDTO> => {
  const details = await getUserDetails(id);

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
