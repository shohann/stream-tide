import { AppError } from "../../libraries/error-handling/AppError";

const model = 'Video';

export const create = async () => {
    try {

    } catch (error: any) {
      console.error(`create(): Failed to create ${model}`, error);
      throw new AppError(`Failed to create ${model}`, error.message);
    }
};

export const search = async () => {
  try {

  } catch (error: any) {
      console.error(`search(): Failed to create ${model}`, error);
      throw new AppError(`Failed to create ${model}`, error.message);
  }
};

export const getById = async () => {
  try {

  } catch (error: any) {
      console.error(`getById(): Failed to create ${model}`, error);
      throw new AppError(`Failed to create ${model}`, error.message);
  }
};

export const updateById = async () => {
  try {

  } catch (error: any) {
      console.error(`updateById(): Failed to create ${model}`, error);
      throw new AppError(`Failed to create ${model}`, error.message);
  }
};

export const deleteById = async () => {
  try {

  } catch (error: any) {
      console.error(`deleteById(): Failed to create ${model}`, error);
      throw new AppError(`Failed to create ${model}`, error.message);
  }
};