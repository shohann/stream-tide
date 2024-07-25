import { User, SelectUser } from "./schema";
import { Express } from "express";

export interface loginRequestDTO {
  email: string;
  password: string;
}

export interface loginResponseDTO {
  id: number;
  accessToken: string;
}

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
  accessToken: string;
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

export type UpdatedUser = User & { id: number };

export interface ProfleUpdateRequestDTO {
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  userName?: string;
  imageFile?: Express.Multer.File;
}

export interface ProfleUpdateResponseDTO {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  userName?: string;
  imageUrl?: string | null | undefined;
}

export interface UserWithRequiredId {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  userName?: string;
  password?: string;
  imagePublicId?: string | null;
  imageUrl?: string | null;
  role?: "user" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
}
