import { v2 as cloudinary, ConfigOptions } from "cloudinary";
import configs from "../../configs";

const initializeCloudinary = (): ConfigOptions => {
  const cloudinaryConfig = cloudinary.config({
    cloud_name: configs.CLOUDINARY_NAME,
    api_key: configs.API_KEY,
    api_secret: configs.API_SECRET,
  });

  return cloudinaryConfig;
};

initializeCloudinary();

export default cloudinary;
