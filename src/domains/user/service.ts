import { AppError } from "../../libraries/error-handling/AppError";

const model = 'product';

export const create = async () => {
    try {

    } catch (error: any) {
      console.error(`create(): Failed to create ${model}`, error);
      throw new AppError(`Failed to create ${model}`, error.message);
    }
};