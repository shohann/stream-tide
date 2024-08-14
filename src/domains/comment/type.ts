interface CreateCommentRequestDTO {
  userId: number;
  videoId: number;
  content: string;
}

interface UpdateCommentRequestDTO {
  commentId: number;
  userId: number;
  content: string;
}
