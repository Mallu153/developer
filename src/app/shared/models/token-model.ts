/**
 * Token Model to map the response from obtain token API
 */
export interface TokenModel {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
}
