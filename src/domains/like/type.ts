export interface CreateLikeRequestDTO {
  userId: number;
  videoId: number;
}

export interface RemoveLikeRequestDTO {
  likeId: number;
  userId: number;
}

export interface GetLikeStatusResposneDTO {
  videoLikeStatus: boolean;
}

export interface GetLikeStatusRequestDTO {
  userId: number;
  videoId: number;
}
