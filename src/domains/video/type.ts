export interface CreateVideoRequestDTO {
  title: string;
  description: string;
  videoFile: Express.Multer.File;
}

export interface CreatedVideo {
  id: number;
  title: string;
  description: string;
}

export interface UpdateVideo {
  id: number;
  title?: string;
  description?: string;
  visibility?: "Public" | "Private" | "Unlisted";
  status?: "pending" | "processed" | "published";
  rawVideoUrl?: string;
  mp4VideoUrl?: string;
  hlsVideoUrl?: string;
  thumbnailUrl?: string;
  cloudFolderId?: string;
}

export interface UpdateVideoFromEvent {
  id: number;
  viewCount?: number;
  status?: "pending" | "processed" | "published";
  rawVideoUrl?: string;
  mp4VideoUrl?: string;
  hlsVideoUrl?: string;
  thumbnailUrl?: string;
  cloudFolderId?: string;
}
