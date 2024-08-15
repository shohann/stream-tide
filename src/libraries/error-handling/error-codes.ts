// Define a type for individual HTTP error structure
type HttpError = {
  name: string;
  code: number;
};

// Define a type for the specific keys of the HTTP_ERRORS object
type HttpErrorKeys =
  | "BadRequest"
  | "Unauthorized"
  | "Forbidden"
  | "NotFound"
  | "MethodNotAllowed"
  | "InternalServerError"
  | "NotImplemented"
  | "BadGateway"
  | "ServiceUnavailable"
  | "GatewayTimeout";

// Define the structure of the HTTP errors object with explicit keys
export const HTTP_ERRORS: Record<HttpErrorKeys, HttpError> = {
  BadRequest: { name: "Bad Request", code: 400 },
  Unauthorized: { name: "Unauthorized", code: 401 },
  Forbidden: { name: "Forbidden", code: 403 },
  NotFound: { name: "Not Found", code: 404 },
  MethodNotAllowed: { name: "Method Not Allowed", code: 405 },
  InternalServerError: { name: "Internal Server Error", code: 500 },
  NotImplemented: { name: "Not Implemented", code: 501 },
  BadGateway: { name: "Bad Gateway", code: 502 },
  ServiceUnavailable: { name: "Service Unavailable", code: 503 },
  GatewayTimeout: { name: "Gateway Timeout", code: 504 },
};
