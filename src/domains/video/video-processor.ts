import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { addQueueItem } from "../../services/queue-service/queue";
import { VIDEO_QUEUE_EVENTS as QUEUE_EVENTS } from "./constant";
import { uploadToCloudinary } from "../../libraries/cloudinary/upload-file";
import fsPromise from "fs/promises";

const configureFFMPEG = async () => {
  ffmpeg.setFfmpegPath(`/usr/bin/ffmpeg`);
  ffmpeg.setFfprobePath(`/usr/bin/ffprobe`);
};

configureFFMPEG();

export const processRawFileToMp4 = async (
  filePath: string,
  outputFolder: string,
  jobData: any
): Promise<string> => {
  const fileExt = path.extname(filePath);
  const fileNameWithoutExt = path.basename(filePath, fileExt);
  const outputFileName = `${outputFolder}/${fileNameWithoutExt}.mp4`;

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
    .on("end", async () => {
      console.log("Finished processing", outputFileName);
      const hlsId = jobData.hlsId;
      const processedCloudURL = await uploadToCloudinary(outputFileName, hlsId);

      await fsPromise.unlink(outputFileName);
      await addQueueItem(QUEUE_EVENTS.VIDEO_PROCESSED, {
        ...jobData,
        completed: true,
        processedCloudURL,
      });
    })
    .on("error", (err: Error) => {
      console.log("An error occurred: " + err.message);
    })
    .run();

  const processedFilePath = outputFileName;
  return processedFilePath;
};

export const generateThumbnail = (
  filePath: string,
  outputFolder: string,
  jobData: any
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileExt = path.extname(filePath);
    const fileNameWithoutExt = path.basename(filePath, fileExt);
    const outputFileName = `${outputFolder}/${fileNameWithoutExt}.png`;

    ffmpeg(filePath)
      .screenshots({
        timestamps: ["00:01"],
        filename: `${fileNameWithoutExt}.png`,
        folder: outputFolder,
      })
      .on("end", () => {
        const hlsId = jobData.hlsId;

        uploadToCloudinary(outputFileName, hlsId)
          .then((url) => {
            console.log("File uploaded successfully. URL:", url);
            return fsPromise.unlink(outputFileName).then(() => {
              addQueueItem(QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED, {
                ...jobData,
                thumbnailCloudURL: url, // Use the cloud URL here
                completed: true,
              });

              resolve(url); // Resolve with the cloud URL
            });
          })
          .catch((error) => {
            console.error("Error uploading file:", error);
            reject(error);
          });
      })
      .on("error", (err: Error) => {
        console.log("An error occurred: " + err.message);
        reject(err);
      });
  });
};

export const processMp4ToHls = (
  filePath: string,
  outputFolder: string,
  jobData: any
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fileExt = path.extname(filePath);
    const fileNameWithoutExt = path.basename(filePath, fileExt);
    const outputFileName = `${outputFolder}/${fileNameWithoutExt}.m3u8`;

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
      .on("end", async () => {
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

export const getVideoDurationAndResolution = async (
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
