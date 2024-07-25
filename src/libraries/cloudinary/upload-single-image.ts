import { UploadApiResponse } from "cloudinary";
import cloudinary from "./cloudinary-config";

interface singleImageResult {
  publicId: string;
  imageURL: string;
}

const uploadSingleImage = async (
  imagePath: string
): Promise<void | singleImageResult> => {
  try {
    const result: any = await cloudinary.uploader
      .upload(imagePath)
      .catch((error) => {
        console.log(error);
      });

    return {
      publicId: result.public_id,
      imageURL: result.secure_url,
    };
  } catch (error) {
    throw error;
  }
};

export default uploadSingleImage;
