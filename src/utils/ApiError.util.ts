export class ApiError extends Error {
  private errorMessage;
  private statusCode;
  constructor(statusCode: number, errorMessage: string) {
    super(errorMessage);
    this.errorMessage = errorMessage;
    this.statusCode = statusCode;
  }
}
