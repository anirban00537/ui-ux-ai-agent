import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Polar } from '@polar-sh/sdk';

@Injectable()
export class PolarService implements OnModuleInit {
  private readonly logger = new Logger(PolarService.name);
  private polarClient: Polar;
  private currentServerMode: 'production' | 'sandbox' = 'production';

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const accessToken = this.configService.get<string>('POLAR_ACCESS_TOKEN');
    if (!accessToken) {
      this.logger.warn(
        'POLAR_ACCESS_TOKEN not configured. Polar.sh features will be disabled.',
      );
      return;
    }

    // Map server URL to Polar SDK's expected literal type
    const serverUrl = this.configService.get<string>('POLAR_SERVER_URL');
    const polarEnvironment =
      this.configService.get<string>('POLAR_ENVIRONMENT');
    let server: 'production' | 'sandbox' = 'production';

    // Log environment variable values for debugging
    this.logger.log(
      `Polar.sh config - POLAR_ENVIRONMENT: ${polarEnvironment || 'not set'}, POLAR_SERVER_URL: ${serverUrl || 'not set'}`,
    );

    // Check explicit environment variable first
    if (polarEnvironment === 'sandbox') {
      server = 'sandbox';
      this.logger.log('Using sandbox mode (POLAR_ENVIRONMENT=sandbox)');
    } else if (polarEnvironment === 'production') {
      server = 'production';
      this.logger.log('Using production mode (POLAR_ENVIRONMENT=production)');
    } else if (serverUrl) {
      // Check if it's a sandbox URL
      if (serverUrl.includes('sandbox') || serverUrl.includes('localhost')) {
        server = 'sandbox';
        this.logger.log('Using sandbox mode (detected from POLAR_SERVER_URL)');
      } else {
        server = 'production';
        this.logger.log(
          'Using production mode (detected from POLAR_SERVER_URL)',
        );
      }
    } else {
      // No explicit setting - default to production but warn
      this.logger.warn(
        'POLAR_ENVIRONMENT not set. Defaulting to production. ' +
          'If using sandbox token, set POLAR_ENVIRONMENT=sandbox in .env and restart server.',
      );
    }

    this.currentServerMode = server;
    this.polarClient = new Polar({
      accessToken,
      server,
    });

    this.logger.log(`Polar.sh client initialized with ${server} server`);
  }

  /**
   * Get Polar client instance
   */
  getClient(): Polar {
    if (!this.polarClient) {
      throw new Error(
        'Polar.sh client not initialized. Please configure POLAR_ACCESS_TOKEN.',
      );
    }
    return this.polarClient;
  }

  /**
   * Check if Polar is configured
   */
  isConfigured(): boolean {
    return !!this.polarClient;
  }

  /**
   * Get customer by external ID (user ID)
   */
  async getCustomerByExternalId(externalId: string) {
    if (!this.isConfigured()) return null;

    try {
      const client = this.getClient();
      const response = await client.customers.getExternal({
        externalId,
      });
      return response;
    } catch (error: any) {
      const statusCode = error?.statusCode || error?.response?.status;
      // Extract status code from body if it's a Polar API error
      const bodyError = error?.body ? JSON.parse(error.body) : null;
      const isNotFound =
        statusCode === 404 || bodyError?.error === 'ResourceNotFound';

      if (statusCode === 401) {
        this.logger.error(
          'Polar.sh authentication failed. Please check your POLAR_ACCESS_TOKEN.',
        );
      } else if (!isNotFound) {
        this.logger.error(
          `Failed to get customer by external ID: ${error?.message || 'Unknown error'}`,
        );
        if (error?.body) {
          this.logger.error(`Error body: ${error.body}`);
        }
      }
      return null;
    }
  }

  /**
   * Get customer by email
   */
  async getCustomerByEmail(email: string) {
    if (!this.isConfigured()) return null;

    try {
      const client = this.getClient();
      const response = await client.customers.list({
        email,
      });

      // Handle both paginated and direct array responses
      const items =
        (response as any).result?.items || (response as any).items || [];
      return items.find(
        (c: any) => c.email.toLowerCase() === email.toLowerCase(),
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to get customer by email: ${error?.message || 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Create or get customer in Polar
   */
  async createOrGetCustomer(userId: string, email: string, name?: string) {
    if (!this.isConfigured()) return null;

    try {
      // 1. Try to get existing customer by external ID (preferred)
      const existingByExternalId = await this.getCustomerByExternalId(userId);
      if (existingByExternalId) {
        return existingByExternalId;
      }

      // 2. Try to get existing customer by email
      const existingByEmail = await this.getCustomerByEmail(email);
      if (existingByEmail) {
        this.logger.log(
          `Found existing Polar customer by email: ${email} (ID: ${existingByEmail.id})`,
        );

        // If it doesn't have an external ID, try to update it to link it
        if (!existingByEmail.externalId && !existingByEmail.external_id) {
          try {
            const client = this.getClient();
            await client.customers.update({
              id: existingByEmail.id,
              customerUpdate: {
                externalId: userId,
              },
            });
            this.logger.log(
              `Linked existing Polar customer ${existingByEmail.id} to user ${userId}`,
            );
          } catch (updateError: any) {
            this.logger.warn(
              `Failed to link existing customer ${existingByEmail.id} to user ${userId}: ${updateError.message}`,
            );
          }
        }
        return existingByEmail;
      }

      // 3. Create new customer if not found by external ID or email
      const client = this.getClient();
      const response = await client.customers.create({
        email,
        name: name || email,
        externalId: userId,
      });

      return response;
    } catch (error: any) {
      // If we still get a "customer already exists" error (e.g. race condition), log it clearly
      const isConflict =
        error?.message?.includes('already exists') ||
        error?.body?.includes('already exists');

      if (isConflict) {
        this.logger.warn(
          `Email conflict during customer creation for ${email}. Attempting last-ditch fetch.`,
        );
        const lastDitch = await this.getCustomerByEmail(email);
        if (lastDitch) return lastDitch;
      }

      this.logger.error(`Failed to create/get customer: ${error.message}`);
      if (error?.body) {
        this.logger.error(`Error body: ${error.body}`);
      }
      return null;
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string) {
    if (!this.isConfigured()) return null;

    try {
      const client = this.getClient();
      const response = await client.subscriptions.get({
        id: subscriptionId,
      });
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to get subscription: ${error?.message || 'Unknown error'}`);
      return null;
    }
  }

  /**
   * Get customer subscriptions
   */
  async getCustomerSubscriptions(customerId: string) {
    if (!this.isConfigured()) return null;

    try {
      const client = this.getClient();
      const response = await client.subscriptions.list({
        customerId,
      });
      return response;
    } catch (error: any) {
      this.logger.error(
        `Failed to get customer subscriptions: ${error?.message || 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true,
  ) {
    if (!this.isConfigured()) return null;

    try {
      const client = this.getClient();
      // Polar SDK requires subscriptionUpdate wrapper for the update payload
      const response = await client.subscriptions.update({
        id: subscriptionId,
        subscriptionUpdate: {
          cancelAtPeriodEnd: cancelAtPeriodEnd,
        },
      });
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to cancel subscription: ${error.message}`);
      // Log more details for debugging
      if (error?.body) {
        this.logger.error(`Error body: ${error.body}`);
      }
      throw error;
    }
  }

  /**
   * Get customer meter balance (for usage-based billing)
   */
  async getCustomerMeterBalance(customerId: string, meterId: string) {
    if (!this.isConfigured()) return null;

    try {
      const client = this.getClient();
      const response = await client.customerMeters.get({
        id: meterId,
      });
      return response;
    } catch (error: any) {
      this.logger.error(
        `Failed to get customer meter balance: ${error?.message || 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * List all products
   */
  async listProducts(organizationId?: string) {
    if (!this.isConfigured()) return null;

    try {
      const client = this.getClient();
      const response = await client.products.list({
        organizationId,
        isArchived: false,
        // Note: Sorting is handled client-side in getProducts() method
      });
      return response;
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      const statusCode = error?.statusCode || error?.response?.status;

      if (statusCode === 401) {
        this.logger.error(
          `Polar.sh authentication failed (401). ` +
            `Current server mode: ${this.currentServerMode}. ` +
            `If using sandbox token, ensure POLAR_ENVIRONMENT=sandbox is set in .env and server is restarted. ` +
            `Error: ${errorMessage}`,
        );
        // Log the actual error details if available
        if (error?.body || error?.response?.data) {
          this.logger.error(
            `Error details: ${JSON.stringify(error.body || error.response.data)}`,
          );
        }
      } else {
        this.logger.error(`Failed to list products: ${errorMessage}`);
      }
      return null;
    }
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: string) {
    if (!this.isConfigured()) return null;

    try {
      const client = this.getClient();
      const response = await client.products.get({
        id: productId,
      });
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to get product: ${error?.message || 'Unknown error'}`);
      return null;
    }
  }

  /**
   * Create checkout session for a product
   */
  async createCheckout(
    productId: string,
    customerEmail: string,
    successUrl?: string,
  ) {
    if (!this.isConfigured()) return null;

    try {
      const client = this.getClient();
      const response = await client.checkouts.create({
        products: [productId], // Polar SDK expects an array of product IDs
        customerEmail: customerEmail,
        successUrl: successUrl,
      });
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to create checkout: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a product
   */
  async createProduct(productData: any) {
    if (!this.isConfigured()) return null;

    try {
      const client = this.getClient();
      const response = await client.products.create(productData);
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to create product: ${error.message}`);
      if (error.body) {
        this.logger.error(`Error body: ${error.body}`);
      }
      throw error;
    }
  }

  /**
   * Update product benefits
   */
  async updateProductBenefits(productId: string, benefitIds: string[]) {
    if (!this.isConfigured()) return null;

    try {
      const client = this.getClient();
      const response = await client.products.updateBenefits({
        id: productId,
        productBenefitsUpdate: {
          benefits: benefitIds,
        },
      });
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to update product benefits: ${error.message}`);
      throw error;
    }
  }
}
