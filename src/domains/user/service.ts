import { AppError } from "../../libraries/error-handling/AppError";
import {
  CreateRequestDTO,
  CreateResponseDTO,
  loginRequestDTO,
  loginResponseDTO,
  UserDetailsResponseDTO,
  ProfleUpdateRequestDTO,
  ProfleUpdateResponseDTO,
  refreshAccessTokenResponseDTO,
} from "./type";
import * as repository from "./repository";
import { UserSelectedFields } from "./type";
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenId,
  verifyRefreshToken,
  verifyToken,
} from "../../libraries/util/jwt";
import {
  generateHashedPassword,
  compareHashedPassword,
} from "../../libraries/util/hash";
import uploadSingleImage, {
  singleFileResult,
} from "../../libraries/cloudinary/upload-single-file";
import { redisService } from "../../services/redis-service";
import fs from "fs/promises";
import generateVerificationCode from "../../libraries/util/generate-verification-code";

const model = "User";

export const logoutAll = async (userId: number): Promise<void> => {
  try {
    const tokens = await redisService.getByPattern(`*${userId.toString()}:*`);

    for (let i = 0; i < tokens.length; i++) {
      await redisService.delete(tokens[i]);
    }
  } catch (error) {
    throw error;
  }
};

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

    const refreshTokenId = generateTokenId(existingUserWithEmail.id.toString());
    const refreshExpiresIn = 60 * 60 * 24 * 7; // Should be stored in config // 15 min

    // Generate refresh token
    const refreshToken = generateRefreshToken({
      id: existingUserWithEmail.id,
      email: existingUserWithEmail.email,
      refreshTokenId: refreshTokenId,
      role: "user",
    });

    // Store refresh token in redis
    await redisService.set(
      refreshTokenId,
      existingUserWithEmail.id.toString(),
      refreshExpiresIn
    );

    // Generate Access token
    const accessToken = generateAccessToken({
      id: existingUserWithEmail.id,
      email: existingUserWithEmail.email,
      role: "user",
    });

    return {
      id: existingUserWithEmail.id,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  } catch (error) {
    throw error;
  }
};

export const refreshAccessToken = async (
  oldRefreshToken: string
): Promise<refreshAccessTokenResponseDTO> => {
  const decoded = verifyRefreshToken(oldRefreshToken);
  const oldRefreshTokenId = decoded.refreshTokenId;
  const existingUser = await redisService.get(oldRefreshTokenId);

  if (!decoded || !existingUser) {
    throw new AppError(
      `${model}: Invalid token`,
      `${model}: Invalid token`,
      409
    );
  }

  const validUser = await repository.checkUserExistanceById(decoded.id);
  if (validUser === false) {
    throw new AppError(
      `${model}: Invalid token`,
      `${model}: Invalid token`,
      409
    );
  }

  const newRefreshTokenId = generateTokenId(decoded.id.toString());
  const refreshExpiresIn = 60 * 60 * 24 * 7; // Should be stored in config // 15 min

  const refreshToken = generateRefreshToken({
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
    refreshTokenId: newRefreshTokenId,
  });

  const accessToken = generateAccessToken({
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
  });

  await redisService.set(
    newRefreshTokenId,
    decoded.id.toString(),
    refreshExpiresIn
  );
  await redisService.delete(oldRefreshTokenId);

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
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

    const refreshTokenId = generateTokenId(user.id.toString());
    const refreshExpiresIn = 60 * 60 * 24 * 7; // Should be stored in config // 15 min

    // Generate refresh token
    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      refreshTokenId: refreshTokenId,
      role: "user",
    });

    // Store refresh token in redis
    await redisService.set(
      refreshTokenId,
      user.id.toString(),
      refreshExpiresIn
    );

    // Generate Access token
    const accessToken = generateAccessToken({
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
      accessToken: accessToken,
      refreshToken: refreshToken,
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

export const updateUserProfile = async (
  data: ProfleUpdateRequestDTO
): Promise<ProfleUpdateResponseDTO> => {
  try {
    const validUser = await repository.checkUserExistanceById(data.userId);
    if (validUser === false) {
      throw new AppError(
        `${model} does not exist`,
        `${model} does not exist`,
        404
      );
    }

    // TODO: Handle old image deletion

    let uploadedImage: singleFileResult | null = null;
    if (data.imageFile) {
      const imagePath = data.imageFile?.path;
      uploadedImage = await uploadSingleImage(imagePath);
      await fs.unlink(imagePath);
    }

    const updatedUser = await repository.updateUser({
      id: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      userName: data.userName,
      imagePublicId: uploadedImage ? uploadedImage.publicId : undefined,
      imageUrl: uploadedImage ? uploadedImage.imageURL : undefined,
    });

    return {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      userName: updatedUser.userName,
      imageUrl: updatedUser.imageUrl,
    };
  } catch (error) {
    throw error;
  }
};
