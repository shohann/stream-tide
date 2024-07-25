import cloudinary from "./cloudinary-config";

export interface singleFileResult {
  publicId: string;
  imageURL: string;
}

const uploadSingleFile = async (
  imagePath: string
): Promise<singleFileResult> => {
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

export default uploadSingleFile;
