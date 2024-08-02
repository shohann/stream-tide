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
import fsPromise from "fs/promises";
import path from "path";
import cloudinary, { UploadApiOptions } from "cloudinary";
import axios from "axios";

const eventEmitter = EventManager.getInstance();

// TODO: After failing a job its still going to the next job
// Next flag

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

// Function to download file from Cloudinary
async function downloadFileFromCloudinary(
  url: string,
  localFolder: string
): Promise<string> {
  const localPath = path.resolve(localFolder, path.basename(url));
  const response = await axios({
    method: "get",
    url,
    responseType: "stream",
  });

  const writer = fs.createWriteStream(localPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(localPath));
    writer.on("error", reject);
  });
}

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

  const rawVideoURL = job.data.rawVideoURL;

  const rawLocalPath = await downloadFileFromCloudinary(
    rawVideoURL,
    "./uploads/videos"
  );
  //

  // Need to create script to create  upload folder content
  // Here we will download the raw file from the cloud then store that locally.Then we will process that.
  // Video processor will still get the local path but now it will get ot after download from the cloud
  // We will use coresponding folders to store the files

  const result = await processRawFileToMp4(
    // `./${job.data.path}`,
    `${rawLocalPath}`, // cloudURL of processed urls
    `./uploads/processed`,
    {
      ...job.data,
      completed: true,
      next: QUEUE_EVENTS.VIDEO_PROCESSED,
    }
  );

  return;
};

const processedHandler = async (job: any) => {
  console.log("processed handler!", job.data.path);

  // Here it will call the db with processed URL
  await addQueueItem(QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATING, {
    ...job.data,
    completed: true,
    next: QUEUE_EVENTS.VIDEO_THUMBNAIL_GENERATING,
  });

  return;
};

const thumbnailGeneratingHandler = async (job: any) => {
  const processedLocalPath = await downloadFileFromCloudinary(
    job.data.processedCloudURL,
    "./uploads/processed"
  );

  const thumbnailPath = await generateThumbnail(
    job.data.processedCloudURL,
    processedLocalPath,
    "./uploads/thumbnails",
    {
      ...job.data,
      completed: true,
    }
  );

  return;
};

const thumbnailGeneratedHandler = async (job: any) => {
  await addQueueItem(QUEUE_EVENTS.VIDEO_HLS_CONVERTING, {
    ...job.data,
    completed: true,
    next: QUEUE_EVENTS.VIDEO_HLS_CONVERTING,
  });

  return;
};

const hlsConvertingHandler = async (job: any) => {
  console.log("HLS converting handler!", job.data.path);

  fs.mkdirSync(`./uploads/hls/${job.data.hlsId}`, { recursive: true });

  const hlsFolderId = job.data.hlsId;

  const processedLocalPath = await downloadFileFromCloudinary(
    job.data.processedCloudURL,
    "./uploads/processed"
  );

  const hlsConverted = await processMp4ToHls(
    // `./${job.data.path}`,
    processedLocalPath,
    `./uploads/hls/${job.data.hlsId}`,
    {
      ...job.data,
      completed: true,
      next: QUEUE_EVENTS.VIDEO_HLS_CONVERTED,
    }
  );

  const m3u8Path =
    "./" +
    path.join(
      "uploads",
      "hls",
      hlsFolderId,
      `${path.basename(hlsConverted, path.extname(hlsConverted))}.m3u8`
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

  await addQueueItem(QUEUE_EVENTS.VIDEO_HLS_CONVERTED, {
    ...job.data,
    cloudinaryM3U8Url,
  });

  await fsPromise.unlink(processedLocalPath);

  await fsPromise.rm(`./uploads/hls/${hlsFolderId}`, {
    recursive: true,
    force: true,
  });

  console.log("hlsConverted", hlsConverted);
  return;
};

const hlsConvertedHandler = async (job: any) => {
  console.log("hls converted handler!", job.data.path);

  await addQueueItem(NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED, {
    ...job.data,
    completed: true,
    next: NOTIFY_EVENTS.NOTIFY_VIDEO_HLS_CONVERTED,
  });
  return;
};

const notifyVideoHlsConvertedHandler = async (job: any) => {
  console.log("notifyVideoHlsConvertedHandler last", job.data.hlsId);

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
