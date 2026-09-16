import { Injectable, Logger } from '@nestjs/common';
import { PolarService } from '../../subscription/services/polar.service';
import { successResponse, errorResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { SubscriptionService } from '../../subscription/subscription.service';

@Injectable()
export class AdminProductsService {
  private readonly logger = new Logger(AdminProductsService.name);

  constructor(
    private readonly polarService: PolarService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  /**
   * Get all products
   */
  async getProducts(): Promise<ResponseModel> {
    try {
      if (!this.polarService.isConfigured()) {
        return errorResponse('Polar.sh is not configured');
      }

      // Use the existing subscription service method to get products
      const response = await this.subscriptionService.getProducts();
      return response;
    } catch (error) {
      this.logger.error('Error fetching products:', error);
      return processException(error);
    }
  }

  /**
   * Get a single product by ID
   */
  async getProduct(id: string): Promise<ResponseModel> {
    try {
      if (!this.polarService.isConfigured()) {
        return errorResponse('Polar.sh is not configured');
      }

      const client = this.polarService.getClient();
      const product = await client.products.get({ id });

      if (!product) {
        return errorResponse('Product not found');
      }

      // Extract features using subscription service helper
      const features = this.subscriptionService.extractFeaturesFromProduct(product);

      // Log metadata to help debug - ensure all fields are returned
      const productMetadata = product.metadata || {};
      this.logger.log(`Product ${id} metadata keys: ${Object.keys(productMetadata).join(', ')}`);
      this.logger.log(`Product ${id} full metadata: ${JSON.stringify(productMetadata)}`);

      return successResponse('Product retrieved successfully', {
        id: product.id,
        name: product.name,
        description: product.description || null,
        isArchived: product.isArchived || false,
        recurringInterval: product.recurringInterval,
        recurringIntervalCount: product.recurringIntervalCount || 1,
        prices: (product.prices || []).map((price: any) => ({
          id: price.id,
          productId: product.id,
          amountType: price.amountType || 'fixed',
          priceAmount: price.priceAmount || 0,
          priceCurrency: price.priceCurrency || 'usd',
          metadata: price.metadata || {},
        })),
        benefits: (product.benefits || []).map((benefit: any) => ({
          id: benefit.id,
          type: benefit.type,
          description: benefit.description,
          selectable: benefit.selectable ?? true,
          metadata: benefit.metadata || {},
          properties: benefit.properties || {},
        })),
        metadata: product.metadata || {},
        features: features.features || [],
        createdAt: product.createdAt,
        updatedAt: (product as any).updatedAt || product.createdAt,
      });
    } catch (error: any) {
      this.logger.error(`Error fetching product ${id}:`, error);
      if (error.statusCode === 404 || error.response?.status === 404) {
        return errorResponse('Product not found');
      }
      return processException(error);
    }
  }

  /**
   * Create a new product
   */
  async createProduct(createProductDto: CreateProductDto): Promise<ResponseModel> {
    try {
      if (!this.polarService.isConfigured()) {
        return errorResponse('Polar.sh is not configured');
      }

      const client = this.polarService.getClient();

      // Prepare product data for Polar API
      const productData: any = {
        name: createProductDto.name,
        description: createProductDto.description || null,
        recurringInterval: createProductDto.recurringInterval || 'month',
        recurringIntervalCount: createProductDto.recurringIntervalCount || 1,
        prices: createProductDto.prices.map((price) => ({
          amountType: price.amountType,
          priceAmount: price.priceAmount || 0,
          priceCurrency: price.priceCurrency || 'usd',
          metadata: price.metadata || {},
        })),
        metadata: createProductDto.metadata || {},
      };

      // Create product
      const product = await client.products.create(productData);

      // Attach benefits if provided
      if (createProductDto.benefitIds && createProductDto.benefitIds.length > 0) {
        try {
          await client.products.updateBenefits({
            id: product.id,
            productBenefitsUpdate: {
              benefits: createProductDto.benefitIds,
            },
          });
          this.logger.log(`Attached ${createProductDto.benefitIds.length} benefits to product ${product.id}`);
        } catch (benefitError: any) {
          this.logger.warn(`Failed to attach benefits to product: ${benefitError.message}`);
          // Don't fail the entire operation if benefits fail
        }
      }

      this.logger.log(`Product created successfully: ${product.id}`);

      return successResponse('Product created successfully', {
        id: product.id,
        name: product.name,
        description: product.description,
        isArchived: product.isArchived || false,
        recurringInterval: product.recurringInterval,
        recurringIntervalCount: product.recurringIntervalCount || 1,
        prices: (product.prices || []).map((price: any) => ({
          id: price.id,
          productId: product.id,
          amountType: price.amountType || 'fixed',
          priceAmount: price.priceAmount || 0,
          priceCurrency: price.priceCurrency || 'usd',
          metadata: price.metadata || {},
        })),
        benefits: (product.benefits || []).map((benefit: any) => ({
          id: benefit.id,
          type: benefit.type,
          description: benefit.description,
          selectable: benefit.selectable ?? true,
          metadata: benefit.metadata || {},
          properties: benefit.properties || {},
        })),
        metadata: product.metadata || {},
        createdAt: product.createdAt,
        updatedAt: (product as any).updatedAt || product.createdAt,
      });
    } catch (error: any) {
      this.logger.error('Error creating product:', error);
      if (error.body) {
        this.logger.error('Error body:', error.body);
      }
      return processException(error);
    }
  }

  /**
   * Update an existing product
   */
  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<ResponseModel> {
    try {
      if (!this.polarService.isConfigured()) {
        return errorResponse('Polar.sh is not configured');
      }

      const client = this.polarService.getClient();

      // Get current product to preserve existing metadata
      const currentProduct = await client.products.get({ id });
      const existingMetadata = currentProduct.metadata || {};

      // Prepare update data
      const updateData: any = {};

      if (updateProductDto.name !== undefined) {
        updateData.name = updateProductDto.name;
      }
      if (updateProductDto.description !== undefined) {
        updateData.description = updateProductDto.description;
      }
      if (updateProductDto.isArchived !== undefined) {
        updateData.isArchived = updateProductDto.isArchived;
      }
      if (updateProductDto.recurringInterval !== undefined) {
        updateData.recurringInterval = updateProductDto.recurringInterval;
      }
      if (updateProductDto.recurringIntervalCount !== undefined) {
        updateData.recurringIntervalCount = updateProductDto.recurringIntervalCount;
      }
      if (updateProductDto.metadata !== undefined) {
        // Merge new metadata with existing metadata to preserve all fields
        updateData.metadata = {
          ...existingMetadata,
          ...updateProductDto.metadata,
        };
      }

      // Update product
      const product = await client.products.update({
        id,
        productUpdate: updateData,
      });

      // Update benefits if provided
      if (updateProductDto.benefitIds !== undefined) {
        try {
          await client.products.updateBenefits({
            id,
            productBenefitsUpdate: {
              benefits: updateProductDto.benefitIds,
            },
          });
          this.logger.log(`Updated benefits for product ${id}`);
        } catch (benefitError: any) {
          this.logger.warn(`Failed to update benefits: ${benefitError.message}`);
          // Don't fail the entire operation if benefits fail
        }
      }

      // Note: Polar API doesn't support updating prices directly through the product update endpoint
      // Prices need to be managed separately through the prices API

      this.logger.log(`Product updated successfully: ${id}`);

      // Fetch updated product to return complete data
      const updatedProduct = await client.products.get({ id });

      // Extract features using subscription service helper
      const features = this.subscriptionService.extractFeaturesFromProduct(updatedProduct);

      this.logger.log(`Product ${id} metadata after update: ${JSON.stringify(updatedProduct.metadata || {})}`);

      return successResponse('Product updated successfully', {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        isArchived: updatedProduct.isArchived || false,
        recurringInterval: updatedProduct.recurringInterval,
        recurringIntervalCount: updatedProduct.recurringIntervalCount || 1,
        prices: (updatedProduct.prices || []).map((price: any) => ({
          id: price.id,
          productId: updatedProduct.id,
          amountType: price.amountType || 'fixed',
          priceAmount: price.priceAmount || 0,
          priceCurrency: price.priceCurrency || 'usd',
          metadata: price.metadata || {},
        })),
        benefits: (updatedProduct.benefits || []).map((benefit: any) => ({
          id: benefit.id,
          type: benefit.type,
          description: benefit.description,
          selectable: benefit.selectable ?? true,
          metadata: benefit.metadata || {},
          properties: benefit.properties || {},
        })),
        metadata: updatedProduct.metadata || {},
        features: features.features || [],
        createdAt: updatedProduct.createdAt,
        updatedAt: (updatedProduct as any).updatedAt || updatedProduct.createdAt,
      });
    } catch (error: any) {
      this.logger.error(`Error updating product ${id}:`, error);
      if (error.statusCode === 404 || error.response?.status === 404) {
        return errorResponse('Product not found');
      }
      if (error.body) {
        this.logger.error('Error body:', error.body);
      }
      return processException(error);
    }
  }

  /**
   * Delete (archive) a product
   */
  async deleteProduct(id: string): Promise<ResponseModel> {
    try {
      if (!this.polarService.isConfigured()) {
        return errorResponse('Polar.sh is not configured');
      }

      const client = this.polarService.getClient();

      // Polar doesn't support hard delete, so we archive the product
      const product = await client.products.update({
        id,
        productUpdate: {
          isArchived: true,
        },
      });

      this.logger.log(`Product archived successfully: ${id}`);

      return successResponse('Product archived successfully', {
        id: product.id,
        name: product.name,
        isArchived: true,
      });
    } catch (error: any) {
      this.logger.error(`Error archiving product ${id}:`, error);
      if (error.statusCode === 404 || error.response?.status === 404) {
        return errorResponse('Product not found');
      }
      return processException(error);
    }
  }
}

