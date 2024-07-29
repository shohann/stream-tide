import { VIDEO_QUEUE_EVENTS as QUEUE_EVENTS, NOTIFY_EVENTS } from "./constant";
import {
  processRawFileToMp4,
  processMp4ToHls,
  generateThumbnail,
} from "./video-processor";
import { addQueueItem } from "../../services/queue-service/queue";
import EventManager from "../../libraries/util/event-manager";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import cloudinary, { UploadApiOptions } from "cloudinary";

cloudinary.v2.config({
  cloud_name: "dgr0nyrze",
  api_key: "919956269641636",
  api_secret: "a6JGaP3EtDH1Fm-hW5RbzPCH-DY",
});

const eventEmitter = EventManager.getInstance();

const uploadToCloudinary = async (
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

    const result = await cloudinary.v2.uploader.upload(filePath, options);
    return result.secure_url;
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

const updateM3U8File = async (
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
        // Continue with the next file
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

const uploadThumbnail = async (
  thumbnailFilePath: string,
  hlsId: string
): Promise<string> => {
  let cloudinaryThumbnailUrl: string | undefined;
  try {
    cloudinaryThumbnailUrl = await uploadToCloudinary(thumbnailFilePath, hlsId);
  } catch (error) {
    console.error("Error uploading thumbnail to Cloudinary:", error);
    cloudinaryThumbnailUrl = thumbnailFilePath;
  }

  return cloudinaryThumbnailUrl;
};

const uploadedHandler = async (job: any) => {
  console.log("uploaded handler!", job.data.path);
  await addQueueItem(QUEUE_EVENTS.VIDEO_PROCESSING, {
    ...job.data,
    completed: true,
  });
  return;
};

const processingHandler = async (job: any) => {
  console.log("processing handler!", job.data.path);

  const hlsId = uuidv4();
  fs.mkdirSync(`./uploads/hls/${hlsId}`, { recursive: true });

  const result = await processRawFileToMp4(
    `./${job.data.path}`,
    `./uploads/processed`,
    {
      ...job.data,
      hlsId,
      completed: true,
      next: QUEUE_EVENTS.VIDEO_PROCESSED,
    }
  );

  return;
};

const processedHandler = async (job: any) => {
  console.log("processed handler!", job.data.path);

  await addQueueItem(QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATING, {
    ...job.data,
    completed: true,
    next: QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATING,
  });

  return;
};

const hlsConvertingHandler = async (job: any) => {
  console.log("HLS converting handler!", job.data.path);

  const hlsConverted = await processMp4ToHls(
    `./${job.data.path}`,
    `./uploads/hls/${job.data.hlsId}`,
    {
      ...job.data,
      completed: true,
      next: QUEUE_EVENTS.VIDEO_HLS_CONVERTED,
    }
  );

  console.log("hlsConverted", hlsConverted);
  return;
};

const hlsConvertedHandler = async (job: any) => {
  console.log("hls converted handler!", job.data.path);
  const hlsFolderId = job.data.hlsId;

  ///
  // const m3u8Path = path.join(
  //   `./uploads/hls/${hlsFolderId}`,
  //   `${path.basename(job.data.path, path.extname(job.data.path))}.m3u8`
  // );

  const m3u8Path =
    "./" +
    path.join(
      "uploads",
      "hls",
      hlsFolderId,
      `${path.basename(job.data.path, path.extname(job.data.path))}.m3u8`
    );

  const tsFiles = fs
    .readdirSync(`./uploads/hls/${hlsFolderId}`)
    .filter((file) => file.endsWith(".ts"))
    // .map((file) => path.join(`./uploads/hls/${hlsFolderId}`, file));
    .map((file) => `./${path.join("uploads", "hls", hlsFolderId, file)}`);

  // Must be uncommented
  let cloudinaryM3U8Url: string | undefined;
  try {
    cloudinaryM3U8Url = await updateM3U8File(m3u8Path, tsFiles, hlsFolderId);
  } catch (error) {
    console.error("Error updating and uploading M3U8 file:", error);
    cloudinaryM3U8Url = m3u8Path;
  }

  await addQueueItem(NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED, {
    ...job.data,
    cloudinaryM3U8Url, //: "ishdshdh", // Testing
    completed: true,
    next: NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED,
  });
  return;
};

const thumbnailGeneratingHandler = async (job: any) => {
  const thumbnailPath = await generateThumbnail(
    job.data.path,
    "./uploads/thumbnails",
    {
      ...job.data,
      completed: true,
    }
  );

  return;
};

const thumbnailGeneratedHandler = async (job: any) => {
  const thumbnailURL = await uploadThumbnail(
    job.data.thumbnailPath,
    job.data.hlsId
  );

  await addQueueItem(QUEUE_EVENTS.VIDEO_HLS_CONVERTING, {
    ...job.data,
    thumbnailURL,
    completed: true,
    next: QUEUE_EVENTS.VIDEO_HLS_CONVERTING,
  });

  return;
};

const notifyVideoHlsConvertedHandler = async (job: any) => {
  console.log("VIDEO_THUMBNAIL_GENERATED handler!", job.data.hlsFolderId);

  eventEmitter.emit(`${NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED}`, job.data);
  return { ...job.data, completed: true, next: null };
};

const QUEUE_EVENT_HANDLERS = {
  [QUEUE_EVENTS.VIDEO_UPLOADED]: uploadedHandler,
  [QUEUE_EVENTS.VIDEO_PROCESSING]: processingHandler,
  [QUEUE_EVENTS.VIDEO_PROCESSED]: processedHandler,
  [QUEUE_EVENTS.VIDEO_HLS_CONVERTING]: hlsConvertingHandler,
  [QUEUE_EVENTS.VIDEO_HLS_CONVERTED]: hlsConvertedHandler,
  [NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED]: notifyVideoHlsConvertedHandler,
  [QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATED]: thumbnailGeneratedHandler,
  [QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATING]: thumbnailGeneratingHandler,
};

export { QUEUE_EVENT_HANDLERS };
