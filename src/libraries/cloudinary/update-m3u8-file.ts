import path from "path";
import fs from "fs";
import { uploadToCloudinary } from "./upload-file";

export const updateM3U8File = async (
  m3u8Path: string,
  tsFiles: string[],
  folderId: string
): Promise<string> => {
  try {
    let content = await fs.promises.readFile(m3u8Path, "utf8");

    for (const tsFile of tsFiles) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(tsFile, folderId);
        content = content.replace(path.basename(tsFile), cloudinaryUrl);
        await fs.promises.unlink(tsFile);
      } catch (error) {
        console.error(`Error processing ts file ${tsFile}:`, error);
      }
    }

    const updatedM3U8Path = m3u8Path.replace(".m3u8", "_updated.m3u8");
    await fs.promises.writeFile(updatedM3U8Path, content);

    let cloudinaryM3U8Url;
    try {
      cloudinaryM3U8Url = await uploadToCloudinary(updatedM3U8Path, folderId);
    } catch (error) {
      console.error("Error uploading M3U8 file to Cloudinary:", error);
      // If Cloudinary upload fails, return the local path
      cloudinaryM3U8Url = updatedM3U8Path;
    }

    // Don't delete the local M3U8 file if Cloudinary upload failed
    if (cloudinaryM3U8Url !== updatedM3U8Path) {
      await fs.promises.unlink(m3u8Path);
      await fs.promises.unlink(updatedM3U8Path);
    }

    return cloudinaryM3U8Url;
  } catch (error: any) {
    console.error("Error in updateM3U8File:", error);
    throw new Error(`Failed to update and upload M3U8 file: ${error.message}`);
  }
};
