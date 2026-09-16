import ms from 'ms';
import { refreshJwtConfig } from '../configs/jwt.config';

type StringValue = `${number}${'' | 'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

/** Returns the token expiration date */
export function getTokenExpirationDate(): Date {
  const duration = refreshJwtConfig.expiresIn as StringValue;
  const expiresInDays = ms(duration) / 1000 / 60 / 60 / 24;
  const expiresAt = addDaysFromNow(expiresInDays);
  return expiresAt;
}

/** Add amount of days from today's date */
function addDaysFromNow(days: number): Date {
  const result = new Date();
  result.setDate(result.getDate() + days);
  return result;
}
