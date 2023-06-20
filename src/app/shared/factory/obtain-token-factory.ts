import { ObtainTokenService } from '../auth/obtain-token.service';

/**
 * Token Factory function to call the Obtain Token service
 * @param token
 * @returns
 */
export function initTokenFactory(token: ObtainTokenService) {
  return () => token.initializeToken();
}
