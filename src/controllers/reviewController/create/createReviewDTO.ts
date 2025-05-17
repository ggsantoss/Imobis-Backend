export interface CreateReviewRequestDTO {
  rating: number;
  comment: string;
  userTargetId?: number;
  orgTargetId?: number;
}
