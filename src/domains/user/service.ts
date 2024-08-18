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
  userListRequestDTO,
  userListResponseDTO,
} from "./type";
import * as repository from "./repository";
import { UserSelectedFields } from "./type";
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenId,
  verifyRefreshToken,
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
import configs from "../../configs";
import { calculatePagination } from "../../libraries/util/response";
import { HTTP_ERRORS } from "../../libraries/error-handling/error-codes";

export const login = async (
  data: loginRequestDTO
): Promise<loginResponseDTO> => {
  const existingUserWithEmail = await repository.getUserDetailsByEmail(
    data.email
  );

  if (!existingUserWithEmail) {
    throw new AppError(
      HTTP_ERRORS.Unauthorized.name,
      `Invalid email or password`,
      HTTP_ERRORS.Unauthorized.code
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
      HTTP_ERRORS.Unauthorized.name,
      `Invalid email or password`,
      HTTP_ERRORS.Unauthorized.code
    );
  }

  const refreshTokenId = generateTokenId(existingUserWithEmail.id.toString());
  const refreshExpiresIn = configs.REFRESH_EXPIRES_IN;

  // Generate refresh token
  const refreshToken = generateRefreshToken({
    id: existingUserWithEmail.id,
    email: existingUserWithEmail.email,
    refreshTokenId: refreshTokenId,
    role: existingUserWithEmail.role,
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
    role: existingUserWithEmail.role,
  });

  return {
    id: existingUserWithEmail.id,
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

export const refreshAccessToken = async (
  oldRefreshToken: string
): Promise<refreshAccessTokenResponseDTO> => {
  const decoded = verifyRefreshToken(oldRefreshToken);
  const oldRefreshTokenId = decoded.refreshTokenId;
  const existingUser = await redisService.get(oldRefreshTokenId);

  if (!decoded || !existingUser) {
    throw new AppError(
      HTTP_ERRORS.Unauthorized.name,
      `Invalid token`,
      HTTP_ERRORS.Unauthorized.code
    );
  }

  const validUser = await repository.checkUserExistanceById(decoded.id);
  if (validUser === false) {
    throw new AppError(
      HTTP_ERRORS.Unauthorized.name,
      `Invalid token`,
      HTTP_ERRORS.Unauthorized.code
    );
  }

  const newRefreshTokenId = generateTokenId(decoded.id.toString());
  const refreshExpiresIn = configs.REFRESH_EXPIRES_IN;

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
  const existingUserWithEmail = await repository.checkUserExistanceByEmail(
    data.email
  );
  if (existingUserWithEmail === true) {
    throw new AppError(
      HTTP_ERRORS.BadRequest.name,
      `Already exist with this email`,
      HTTP_ERRORS.BadRequest.code
    );
  }

  const existingUserWithUserName = await repository.checkUserExistanceByUseName(
    data.userName
  );
  if (existingUserWithUserName === true) {
    throw new AppError(
      HTTP_ERRORS.BadRequest.name,
      `Already exist with this username`,
      HTTP_ERRORS.BadRequest.code
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
  const refreshExpiresIn = configs.REFRESH_EXPIRES_IN;

  // Generate refresh token
  const refreshToken = generateRefreshToken({
    id: user.id,
    email: user.email,
    refreshTokenId: refreshTokenId,
    role: user.role,
  });

  // Store refresh token in redis
  await redisService.set(refreshTokenId, user.id.toString(), refreshExpiresIn);

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
};

export const list = async (
  data: userListRequestDTO
): Promise<userListResponseDTO> => {
  if (!data.page && !data.size) {
    data.page = 1;
    data.size = 10;
  }
  const userSelects: Partial<UserSelectedFields> = {
    id: true,
    firstName: true,
    lastName: true,
    createdAt: false,
  };
  const userList = await repository.getUsers(userSelects, data.page, data.size);
  const totalItems = await repository.getUserListCount();
  const pagination = calculatePagination(data.page, data.size, totalItems);

  return {
    data: userList,
    pagination,
  };
};

export const details = async (id: number): Promise<UserDetailsResponseDTO> => {
  const details = await repository.getUserDetails(id);

  if (!details) {
    throw new AppError(
      HTTP_ERRORS.NotFound.name,
      `User not found`,
      HTTP_ERRORS.NotFound.code
    );
  }

  const finalDetails: UserDetailsResponseDTO = {
    id: details.id,
    firstName: details.firstName,
    lastName: details.lastName,
    email: details.email,
    userName: details.userName,
    image: details.userName,
    createdAt: details.createdAt,
    role: details.role,
  };

  return finalDetails;
};

export const updateUserProfile = async (
  data: ProfleUpdateRequestDTO
): Promise<ProfleUpdateResponseDTO> => {
  const validUser = await repository.checkUserExistanceById(data.userId);
  if (validUser === false) {
    throw new AppError(
      HTTP_ERRORS.NotFound.name,
      `User does not exist`,
      HTTP_ERRORS.NotFound.code
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
};

export const logoutAll = async (userId: number): Promise<void> => {
  const tokens = await redisService.getByPattern(`*${userId.toString()}:*`);

  for (let i = 0; i < tokens.length; i++) {
    await redisService.delete(tokens[i]);
  }
};
