import { ObtainToken } from '../models/obtain-token';

/**
 * Token credentials requires 5 paramatars
 * re1 - client_id
 * re2 - password
 * re3 - grant_type
 * re4 - client_secret
 * re5 - usernane
 */
export const TravtronicsTokenConfig: ObtainToken = {
  re1: 'travtronics-app',
  re2: 'password',
  re3: 'password',
  re4: '2583fea2-fe0e-4ede-924b-4b9dd3b14c94',
  re5: 'admin',
};
