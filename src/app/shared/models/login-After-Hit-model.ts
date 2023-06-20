export interface LohinResponseSendPHP {
  collection: string;
  database: string;
  data: LoginApiResonse
}

export class LoginApiResonse {
  loginResponse: string;
  userId: string;
  userRoles: string[];
  userName: string;
  fullName: string;
}
