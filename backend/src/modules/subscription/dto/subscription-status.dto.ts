import { SubscriptionResponseDto } from './subscription-response.dto';
import { CreditBalanceResponseDto } from './credit-balance-response.dto';
import { FeatureResponseDto } from './feature-response.dto';

export class SubscriptionStatusDto {
  subscription: SubscriptionResponseDto | null;
  creditBalance: CreditBalanceResponseDto | null;
  isActive: boolean;
  hasAccess: boolean;
  hasCredits: boolean;
  features?: FeatureResponseDto | null;
  slideLimit?: number | null;
  storageLimit?: number | null;
  storageUsage?: number | null;
  planName?: string | null;
}
