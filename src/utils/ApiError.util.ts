export class ApiError extends Error {
  private errorMessage;
  private statusCode;
  private errors;
  constructor(statusCode: number, errorMessage: string, errors?: any[]) {
    super(errorMessage);
    this.errorMessage = errorMessage;
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
