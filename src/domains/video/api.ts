import express, { Request, Response, NextFunction } from "express";
import upload from "../../libraries/util/upload";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import cloudinary, { UploadApiOptions } from "cloudinary";
import { promisify } from "util";
import { addQueueItem } from "./temp/queues";
import { VIDEO_QUEUE_EVENTS as QUEUE_EVENTS } from "./temp/constants";

const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

const configureFFMPEG = async () => {
  ffmpeg.setFfmpegPath(`/usr/bin/ffmpeg`);
  ffmpeg.setFfprobePath(`/usr/bin/ffprobe`);
};

configureFFMPEG();

cloudinary.v2.config({
  cloud_name: "dgr0nyrze",
  api_key: "919956269641636",
  api_secret: "a6JGaP3EtDH1Fm-hW5RbzPCH-DY",
});

const processRawFileToMp4 = (
  filePath: string,
  outputFolder: string
): Promise<string> => {
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);
  const outputFileName = `${outputFolder}/${fileNameWithoutExt}.mp4`;

  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .output(outputFileName)
      .on("start", (commandLine: string) => {
        console.log("Spawned Ffmpeg with command: " + commandLine);
      })
      .on("progress", (progress: any) => {
        if (parseInt(progress.percent) % 20 === 0) {
          console.log("Processing: " + progress.percent + "% done");
        }
      })
      .on("end", () => {
        console.log("Finished processing", outputFileName);
        resolve(outputFileName);
      })
      .on("error", (err: Error) => {
        console.log("An error occurred: " + err.message);
        reject(err);
      })
      .run();
  });
};

const generateThumbnail = (
  filePath: string,
  outputFolder: string
): Promise<string> => {
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);
  const outputFileName = `${outputFolder}/${fileNameWithoutExt}.png`;

  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .screenshots({
        timestamps: ["00:01"],
        filename: `${fileNameWithoutExt}.png`,
        folder: outputFolder,
      })
      .on("end", () => {
        resolve(outputFileName);
      })
      .on("error", (err: Error) => {
        reject(err);
      });
  });
};

const processMp4ToHls = (
  filePath: string,
  outputFolder: string
): Promise<void> => {
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);
  const outputFileName = `${outputFolder}/${fileNameWithoutExt}.m3u8`;

  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .output(outputFileName)
      .outputOptions([
        "-hls_time 10",
        "-hls_list_size 0",
        "-hls_flags delete_segments",
        "-hls_segment_filename",
        `${outputFolder}/${fileNameWithoutExt}_%03d.ts`,
      ])
      .on("start", (commandLine: string) => {
        console.log("Spawned Ffmpeg with command: " + commandLine);
      })
      .on("progress", (progress: any) => {
        if (parseInt(progress.percent) % 20 === 0) {
          console.log("Processing: " + progress.percent + "% done");
        }
      })
      .on("end", () => {
        console.log("Finished processing", outputFileName);
        resolve();
      })
      .on("error", (err: Error) => {
        console.log("An error occurred: " + err.message);
        reject(err);
      })
      .run();
  });
};

const getVideoDurationAndResolution = async (
  filePath: string
): Promise<{
  videoDuration: number;
  videoResolution: { height: number; width: number };
}> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err: Error, metadata: any) => {
      if (err) {
        reject(err);
        return;
      }
      const videoDuration = parseInt(metadata.format.duration);
      const videoResolution = {
        height: metadata.streams[0].coded_height,
        width: metadata.streams[0].coded_width,
      };
      resolve({ videoDuration, videoResolution });
    });
  });
};

const uploadToCloudinary = async (filePath: string): Promise<string> => {
  try {
    const options: UploadApiOptions = {
      resource_type:
        path.extname(filePath).toLowerCase() === ".m3u8" ? "raw" : "auto",
      use_filename: true,
      unique_filename: false,
    };

    const result = await cloudinary.v2.uploader.upload(filePath, options);
    return result.secure_url;
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

const updateM3U8File = async (
  m3u8Path: string,
  tsFiles: string[]
): Promise<string> => {
  try {
    let content = await fs.promises.readFile(m3u8Path, "utf8");

    for (const tsFile of tsFiles) {
      try {
        const cloudinaryUrl = await uploadToCloudinary(tsFile);
        content = content.replace(path.basename(tsFile), cloudinaryUrl);
        await fs.promises.unlink(tsFile);
      } catch (error) {
        console.error(`Error processing ts file ${tsFile}:`, error);
        // Continue with the next file
      }
    }

    const updatedM3U8Path = m3u8Path.replace(".m3u8", "_updated.m3u8");
    await fs.promises.writeFile(updatedM3U8Path, content);

    let cloudinaryM3U8Url;
    try {
      cloudinaryM3U8Url = await uploadToCloudinary(updatedM3U8Path);
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

const model = "Video";

const routes = () => {
  const router = express.Router();
  console.log(`Setting up routes ${model}`);

  router.post(
    "/",
    upload.single("file"),
    async (req: Request, res: Response, next: NextFunction) => {
      let rawVideoPath: string | undefined;
      let mp4Path: string | undefined;
      let thumbnailFilePath: string | undefined;
      let outputPath: string | undefined;
      let cloudinaryM3U8Url: string | undefined;
      let cloudinaryThumbnailUrl: string | undefined;

      try {
        if (!req.file) {
          return next(new Error("No file data"));
        }
        const lessonId = uuidv4();
        rawVideoPath = req.file?.path;
        outputPath = `./uploads/course/${lessonId}`;
        const thumbnailPath = `./uploads/thumbnails`;

        fs.mkdirSync(outputPath, { recursive: true });
        fs.mkdirSync(thumbnailPath, { recursive: true });

        // Process raw file to MP4
        mp4Path = await processRawFileToMp4(rawVideoPath, outputPath);

        // Generate thumbnail
        thumbnailFilePath = await generateThumbnail(mp4Path, thumbnailPath);

        // Get video duration and resolution
        const { videoDuration, videoResolution } =
          await getVideoDurationAndResolution(mp4Path);

        // Process MP4 to HLS
        await processMp4ToHls(mp4Path, outputPath);

        const m3u8Path = path.join(
          outputPath,
          `${path.basename(mp4Path, path.extname(mp4Path))}.m3u8`
        );
        const tsFiles = fs
          .readdirSync(outputPath)
          .filter((file) => file.endsWith(".ts"))
          .map((file) => path.join(outputPath, file));

        try {
          cloudinaryM3U8Url = await updateM3U8File(m3u8Path, tsFiles);
        } catch (error) {
          console.error("Error updating and uploading M3U8 file:", error);
          cloudinaryM3U8Url = m3u8Path;
        }

        // Upload thumbnail to Cloudinary
        try {
          cloudinaryThumbnailUrl = await uploadToCloudinary(thumbnailFilePath);
        } catch (error) {
          console.error("Error uploading thumbnail to Cloudinary:", error);
          cloudinaryThumbnailUrl = thumbnailFilePath;
        }

        res.status(201).send({
          message: "File uploaded and processed successfully",
          hlsPath: cloudinaryM3U8Url,
          thumbnailPath: cloudinaryThumbnailUrl,
          duration: videoDuration,
          resolution: videoResolution,
        });
      } catch (error: any) {
        console.error("Error in video processing:", error);
        next(error);
      } finally {
        // Clean up local files
        try {
          if (rawVideoPath) await fs.promises.unlink(rawVideoPath);
          if (mp4Path) await fs.promises.unlink(mp4Path);
          if (
            thumbnailFilePath &&
            cloudinaryThumbnailUrl !== thumbnailFilePath
          ) {
            await fs.promises.unlink(thumbnailFilePath);
          }
          if (outputPath && cloudinaryM3U8Url !== outputPath) {
            await fs.promises.rmdir(outputPath, { recursive: true });
          }
        } catch (cleanupError) {
          console.error("Error during cleanup:", cleanupError);
        }
      }
    }
  );

  router.post(
    "/upload",
    upload.single("file"),
    async (req: Request, res: Response, next: NextFunction) => {
      let rawVideoPath: string | undefined;
      let mp4Path: string | undefined;
      let thumbnailFilePath: string | undefined;
      let outputPath: string | undefined;
      let cloudinaryM3U8Url: string | undefined;
      let cloudinaryThumbnailUrl: string | undefined;
      try {
        if (!req.file) {
          return next(new Error("No file data"));
        }

        rawVideoPath = req.file?.path;

        await addQueueItem(QUEUE_EVENTS.VIDEO_UPLOADED, {
          path: rawVideoPath,
        });

        res.status(201).send("Video has been uploaded successfully");
      } catch (error) {
        console.error("Error in video processing:", error);
        next(error);
      }
    }
  );

  return router;
};

export default routes;
