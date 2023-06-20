export class ApiResponse {
  success?: number;
  data: any[];
  message: string;
  errors: any;
  status: number;
  statusCode?:boolean;
}
