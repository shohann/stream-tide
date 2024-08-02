import { UploadApiOptions } from "cloudinary";
import path from "path";
import cloudinary from "./cloudinary-config";

export const uploadToCloudinary = async (
  filePath: string,
  folderId: string
): Promise<string> => {
  try {
    const options: UploadApiOptions = {
      folder: folderId,
      resource_type:
        path.extname(filePath).toLowerCase() === ".m3u8" ? "raw" : "auto",
      use_filename: true,
      unique_filename: false,
    };

    const result = await cloudinary.uploader.upload(filePath, options);
    return result.secure_url;
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};
