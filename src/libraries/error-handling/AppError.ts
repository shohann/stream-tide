export class AppError extends Error {
    name: string;
    HTTPStatus: number;
    isTrusted: boolean;
    cause: Error | null;
  
    constructor(
      name: string,
      message: string,
      HTTPStatus: number = 500,
      isTrusted: boolean = true,
      cause: Error | null = null
    ) {
      super(message);
      this.name = name;
      this.message = message;
      this.HTTPStatus = HTTPStatus;
      this.isTrusted = isTrusted;
      this.cause = cause;
    }
  }