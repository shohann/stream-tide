// const uploadToCloudinary = async (filePath: string): Promise<string> => {
//     try {
//       const options: UploadApiOptions = {
//         resource_type:
//           path.extname(filePath).toLowerCase() === ".m3u8" ? "raw" : "auto",
//         use_filename: true,
//         unique_filename: false,
//       };

//       const result = await cloudinary.v2.uploader.upload(filePath, options);
//       return result.secure_url;
//     } catch (error: any) {
//       console.error("Cloudinary upload error:", error);
//       throw new Error(`Cloudinary upload failed: ${error.message}`);
//     }
//   };
