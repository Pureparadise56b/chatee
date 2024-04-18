export class ApiResponse {
  private statusCode;
  private data;
  private message;
  constructor(statusCode: number, message: string, data?: any) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
