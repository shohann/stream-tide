import { User, SelectUser } from "./schema";

export interface CreateRequestDTO {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
}

export interface CreateResponseDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
}

export interface UserDetailsResponseDTO {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  image?: string | null;
  createdAt?: Date | null;
}

export type CreatedUser = User & { id: number };

export type UserDetail = User & { id: number; createdAt: Date | null };

export type UserSelectedFields = {
  [K in keyof SelectUser]: boolean;
};

export type ListedUser = Partial<User>;
