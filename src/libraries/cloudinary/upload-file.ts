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

export const deleteFolder = async (folderName: string) => {
  try {
    const resourceTypes = ["image", "video", "raw"]; // Add all relevant resource types
    for (const resourceType of resourceTypes) {
      let next_cursor = null;

      do {
        const { resources, next_cursor: new_cursor } =
          await cloudinary.api.resources({
            type: "upload",
            prefix: folderName,
            resource_type: resourceType, // Specify the resource type here
            max_results: 500,
            next_cursor,
          });

        for (const resource of resources) {
          await cloudinary.uploader.destroy(resource.public_id, {
            resource_type: resourceType,
          });
          console.log(`Deleted: ${resource.public_id} (Type: ${resourceType})`);
        }

        next_cursor = new_cursor;
      } while (next_cursor);
    }

    console.log("All files deleted successfully in folder:", folderName);

    await cloudinary.api.delete_folder(folderName);
  } catch (error) {
    throw error;
  }
};
