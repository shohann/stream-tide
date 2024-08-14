import { Pagination } from "../../libraries/util/response";

enum VIDEO_VISIBILITIES {
  PUBLIC = "Public",
  PRIVATE = "Private",
  UNLISTED = "Unlisted",
}

export interface CreateVideoRequestDTO {
  ownerId: number;
  title: string;
  description: string;
  videoFile: Express.Multer.File;
}

export interface CreatedVideo {
  id: number;
  title: string;
  description: string;
}

export interface UpdateOwnVideoRequestDTO {
  id: number;
  userId: number;
  title?: string;
  description?: string;
  visibility?: "Public" | "Private";
}

export interface UpdateOwnVideoResponseDTO {
  id: number;
  title?: string;
  description?: string;
  visibility?: "Public" | "Private" | "Unlisted";
  status?: "pending" | "processed" | "published";
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
  visibility?: "Public" | "Private" | "Unlisted";
}

export interface GetOwnVideoDetails {
  id: number;
  title: string;
  description: string;
  viewCount: number;
  hlsVideoUrl?: string | null;
  visibility: string;
  status: "pending" | "processed" | "published";
  ownerId: number;
  createdAt: Date | null;
}

// id: videoSchema.id,
// title: videoSchema.title,
// description: videoSchema.description,
// viewCount: videoSchema.viewCount,
// hlsVideoUrl: videoSchema.hlsVideoUrl,
// createdAt: videoSchema.createdAt,
// visibility: videoSchema.visibility,
// status: videoSchema.status,

export interface GetPublishedVideoDetailsDTO {
  id: number;
  title: string;
  description: string;
  viewCount: number;
  hlsVideoUrl: string | null;
  visibility: string;
  createdAt: Date | null;
  owner: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
}

export interface PublishedVideosRequestDTO {
  page: number;
  size: number;
  search?: string | undefined;
}

export interface PublishedVideoList {
  id: number;
  title: string;
  viewCount: number;
  thumbnailUrl: string | null;
  visibility: string;
  createdAt: Date | null;
  owner: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
}

export interface PublishedVideoListResponseDTO {
  data:
    | {
        id: number;
        title: string;
        viewCount: number;
        thumbnailUrl: string | null;
        visibility: string;
        createdAt: Date | null;
        owner: {
          id: number;
          firstName: string;
          lastName: string;
        } | null;
      }[]
    | [];
  pagination?: Pagination;
}
