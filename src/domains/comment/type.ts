import { Pagination } from "../../libraries/util/response";

export interface CreateCommentRequestDTO {
  userId: number;
  videoId: number;
  content: string;
}

export interface CreateCommentResponseDTO {
  id: number;
  userId: number;
  videoId: number;
  content: string;
  createdAt: Date;
}

export interface UpdateCommentRequestDTO {
  commentId: number;
  userId: number;
  content: string;
}

export interface UpdateCommentResponseDTO {
  id: number;
  userId: number;
  videoId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatedComment {
  id: number;
  userId: number;
  videoId: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentWithUser {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
}

export interface CommentListResponseDTO {
  data:
    | {
        id: number;
        content: string;
        createdAt: Date;
        updatedAt: Date;
        user: {
          id: number;
          firstName: string;
          lastName: string;
        } | null;
      }[]
    | [];
  pagination?: Pagination;
}

export interface CommentListRequestDTO {
  videoId: number;
  page: number;
  size: number;
}
