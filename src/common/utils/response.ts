export class Response {
  constructor(
    public message = 'success',
    public data: any = {},
    public statusCode: number = 200,
  ) {}
}
