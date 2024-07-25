import express, { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";

export const uploadToCloudnary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Configuration
    cloudinary.config({
      cloud_name: "dgr0nyrze",
      api_key: "919956269641636",
      api_secret: "a6JGaP3EtDH1Fm-hW5RbzPCH-DY",
    });

    const imagePath = req.file?.path;

    let uploadResult: any;
    if (imagePath) {
      uploadResult = await cloudinary.uploader
        .upload(imagePath)
        .catch((error) => {
          console.log(error);
        });

      if (uploadResult.public_id) {
        const deletedImage = await cloudinary.uploader.destroy(
          uploadResult.public_id
        );

        console.log(deletedImage);
      }

      next();
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};
