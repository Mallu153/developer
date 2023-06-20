export interface LoginResponse {
  loginResponse: string;
  userId: string;
  userRoles: string[];
  userName: string;
  fullName: string;
  businessUnit?: string;
  businessUnitId?: number;
  costCenter?: string;
  costCenterId?: number;
  dept?: string;
  deptId?: number;
  locationId?: number;
  locationInfo?: string;
  org?: string;
  orgId?: number;
  ttUserId?: number;
  refresh_token?: string;
  roleId?: number;
  roleName?: string;
  roleKey?: string;
  bizId:number;
  bizName:string;
  contactId:number;
  contactName:string;
  pagePath?:string;
  url?:string,

  menu:any;
}
export interface LoginModel {
  email: string;
  password: string;
}

export interface TokenPayload {
  exp: number;
  iat: number;
  jti: string;
  iss: string;
  aud: string;
  sub: string;
  typ: string;
  azp: string;
  session_state: string;
  acr: string;
  'allowed-origins': string[];
  realm_access: RealmAccess;
  resource_access: ResourceAccess;
  scope: string;
  sid: string;
  email_verified: boolean;
  wtProfile: string;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  userId: number;
  email: string;
  wtId: number;
}

export interface RealmAccess {
  roles: string[];
}

export interface ResourceAccess {
  account: RealmAccess;
}
export class RefreshTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  session_state: string;
  scope: string;
}



export interface verifyToken {
  active:     boolean;
  timestamp:  Date;
  message:    string;
  statusCode: number;
}
