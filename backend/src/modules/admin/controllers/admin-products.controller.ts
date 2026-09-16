import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { IsAdmin } from 'src/shared/decorators/is-admin.decorator';
import { ResponseModel } from 'src/shared/models/response.model';
import { AdminProductsService } from '../services/admin-products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Controller('admin/products')
@UseGuards(JwtAuthGuard)
@IsAdmin()
export class AdminProductsController {
  constructor(private readonly productsService: AdminProductsService) {}

  @Get()
  async getProducts(): Promise<ResponseModel> {
    return this.productsService.getProducts();
  }

  @Get(':id')
  async getProduct(@Param('id') id: string): Promise<ResponseModel> {
    return this.productsService.getProduct(id);
  }

  @Post()
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ResponseModel> {
    return this.productsService.createProduct(createProductDto);
  }

  @Patch(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ResponseModel> {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string): Promise<ResponseModel> {
    return this.productsService.deleteProduct(id);
  }
}
