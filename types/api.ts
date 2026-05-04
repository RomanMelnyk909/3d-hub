export interface ApiError {
  error: string;
  code: ApiErrorCode;
}

export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export type AsyncState = "idle" | "loading" | "success" | "error";
