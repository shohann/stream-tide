// Define types for the event objects
type VideoQueueEvents = {
  VIDEO_UPLOADED: string;
  UPLOADING_RAW_VIDEO: string;
  UPLOADED_RAW_VIDEO: string;
  VIDEO_PROCESSING: string;
  VIDEO_PROCESSED: string;
  UPLOADING_PROCESSED_VIDEO: string;
  UPLOADED_PROCESSED_VIDEO: string;
  VIDEO_THUMBNAIL_GENERATING: string;
  VIDEO_THUMBNAIL_GENERATED: string;
  VIDEO_HLS_CONVERTING: string;
  VIDEO_HLS_CONVERTED: string;
  VIDEO_HLS_CONVERTED_UPLOADING: string;
  VIDEO_HLS_CONVERTED_UPLOADED: string;
  VIDEO_THUMBNAIL_GENERATED_UPLOADING: string;
  VIDEO_THUMBNAIL_GENERATED_UPLOADED: string;
};

type NotifyEvents = {
  NOTIFY_VIDEO_HLS_CONVERTED: string;
};

type AllEvents = VideoQueueEvents & NotifyEvents;

// Define the event constants
const VIDEO_QUEUE_EVENTS: VideoQueueEvents = {
  VIDEO_UPLOADED: "video.uploaded",
  UPLOADING_RAW_VIDEO: "raw.video.uploading",
  UPLOADED_RAW_VIDEO: "raw.video.uploaded",
  VIDEO_PROCESSING: "video.processing",
  VIDEO_PROCESSED: "video.processed",
  UPLOADING_PROCESSED_VIDEO: "processed.video.uploading",
  UPLOADED_PROCESSED_VIDEO: "processed.video.uploaded",
  VIDEO_THUMBNAIL_GENERATING: "video.thumbnail.generateing",
  VIDEO_THUMBNAIL_GENERATED: "video.thumbnail.generated",
  VIDEO_THUMBNAIL_GENERATED_UPLOADING: "video.thumbnail.generated.uploading",
  VIDEO_THUMBNAIL_GENERATED_UPLOADED: "video.thumbnail.generated.uploaded",
  VIDEO_HLS_CONVERTING: "video.hls-converting",
  VIDEO_HLS_CONVERTED: "video.hls.converted",
  VIDEO_HLS_CONVERTED_UPLOADING: "video.hls.converted.uploading",
  VIDEO_HLS_CONVERTED_UPLOADED: "video.hls.converted.uploaded",
};

const NOTIFY_EVENTS: NotifyEvents = {
  NOTIFY_VIDEO_HLS_CONVERTED: "notify.video.hls.converted",
};

// Merge the event objects into a single object
const ALL_EVENTS: AllEvents = {
  ...VIDEO_QUEUE_EVENTS,
  ...NOTIFY_EVENTS,
};

// Export the event constants
export { VIDEO_QUEUE_EVENTS, NOTIFY_EVENTS, ALL_EVENTS };
