# Subscription Module with Polar.sh Integration

This module provides subscription management and AI credit tracking using Polar.sh.

## Features

- **Polar.sh Integration**: Full integration with Polar.sh for subscription management
- **Credit System**: Track and manage AI credits for users
- **Webhook Support**: Handle Polar.sh webhook events for real-time subscription updates
- **Credit Deduction**: Automatically deduct credits when AI features are used

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Polar.sh Configuration
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_webhook_secret
POLAR_SERVER_URL=https://api.polar.sh  # Optional, defaults to production
POLAR_ENVIRONMENT=sandbox  # Set to "sandbox" if using sandbox token, or "production" for production
```

**Important for Sandbox:**
- If you're using a **sandbox access token**, you **must** set `POLAR_ENVIRONMENT=sandbox`
- Sandbox tokens won't work with production mode
- The `POLAR_SERVER_URL` can remain `https://api.polar.sh` - the `POLAR_ENVIRONMENT` setting determines the mode

**Important**: Get your access token from:
1. Go to https://polar.sh
2. Navigate to Settings → API
3. Generate or copy your access token
4. Make sure the token has the required scopes: `products:read`, `subscriptions:read`, `subscriptions:write`, `customers:read`, `customers:write`

### 2. Database Migration

The database tables have been created. If you need to recreate them:

```bash
npm run prisma:generate
```

### 3. Create Products in Polar.sh Dashboard

**Yes, you need to create products in the Polar.sh dashboard!**

1. Go to https://polar.sh
2. Navigate to **Products**
3. Click **"Create Product"**
4. Configure your product:
   - **Name**: e.g., "Free", "Pro", "Enterprise"
   - **Description**: Product description
   - **Recurring Interval**: month, year, etc.
   - **Price**: Set the price amount
   - **Benefits**: Add features/benefits

5. **Add Credit Limits to Product Metadata** (Optional):
   - In product metadata, you can add: `{"monthlyCreditLimit": 1000}`
   - Or configure in code (see step 4)

### 4. Configure Credit Limits

Update the `getMonthlyCreditLimit` method in `subscription.service.ts` to map your Polar.sh product IDs to credit limits:

```typescript
private getMonthlyCreditLimit(productId?: string): number {
  const limits: Record<string, number> = {
    'b0d421eb-615c-4ef8-9053-1a8449afbcc0': 1000, // Your existing product
    // Add more product IDs and their credit limits here
    // 'prod_free': 10,
    // 'prod_pro': 1000,
    // 'prod_enterprise': 10000,
  };
  return limits[productId || ''] || 0;
}
```

### 5. Configure Credits Per Card

Update the `creditsPerCard` value in `doc.controller.ts` based on your pricing:

```typescript
const creditsPerCard = 1; // Adjust based on your pricing model
```

## API Endpoints

### Get Subscription Status
```
GET /api/subscription/status
```
Returns subscription status and credit balance.

### Sync Subscription from Polar.sh
```
GET /api/subscription/sync
```
Manually sync subscription data from Polar.sh.

### Cancel Subscription
```
POST /api/subscription/cancel
```
Cancels the subscription (at period end).

### Get Credit Balance
```
GET /api/subscription/credits
```
Returns current credit balance.

### Use Credits
```
POST /api/subscription/credits/use
Body: {
  "amount": 1,
  "description": "Generated cards",
  "docId": "optional-id"
}
```

### Get Products/Pricing Plans
```
GET /api/subscription/products
```
Returns all available products from Polar.sh.

### Get Product by ID
```
GET /api/subscription/products/:id
```
Returns a specific product.

### Webhook Endpoint
```
POST /api/subscription/webhook
```
Handles Polar.sh webhook events. Configure this URL in your Polar.sh dashboard.

## Troubleshooting

### Error: "Failed to fetch products from Polar.sh"
- **401 Error**: Your `POLAR_ACCESS_TOKEN` is invalid or expired
  - Go to Polar.sh → Settings → API
  - Generate a new access token
  - Update your `.env` file
  - Restart your server

- **No Products**: Create products in the Polar.sh dashboard first
  - Products must be created in Polar.sh before they appear in the API

### Error: "Table does not exist"
- Run: `npx prisma db push` or `npx prisma migrate dev`
- Make sure Prisma Client is generated: `npx prisma generate`

## Webhook Events Handled

- `subscription.created` - New subscription created
- `subscription.updated` - Subscription updated
- `subscription.canceled` - Subscription canceled
- `customer.created` - New customer created
- `customer.updated` - Customer updated
- `meter.usage_recorded` - Usage-based billing event

## Credit System

### Credit Types

1. **Free Credits**: Initial credits given to all users (default: 10)
2. **Paid Credits**: Credits from subscription plans
3. **Monthly Credits**: Credits that reset each billing cycle

### Credit Usage Priority

Credits are deducted in this order:
1. Free credits (used first)
2. Paid credits (used after free credits are exhausted)

### Automatic Credit Deduction

Credits are automatically deducted when:
- Generating cards from outline (1 credit per card)
- Using AI features in docs

## Integration with Doc Service

The subscription module is integrated with the doc service to:
- Check credit balance before generating cards
- Deduct credits after successful card generation
- Prevent card generation if insufficient credits

## Testing

1. Create a test customer in Polar.sh
2. Create a subscription for the customer
3. Test credit deduction by generating cards
4. Verify webhook events are received and processed

## Notes

- Free credits are given to all users on account creation
- Monthly credits reset when subscription renews
- Credits are tracked per user and per transaction
- All credit transactions are logged for audit purposes
- **Products must be created in Polar.sh dashboard** - they are not created via API
