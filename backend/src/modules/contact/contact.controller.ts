import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { Public } from 'src/shared/decorators/public.decorator';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a new contact inquiry' })
  @ApiResponse({ status: 201, description: 'Inquiry successfully submitted' })
  async create(@Body() createInquiryDto: CreateInquiryDto) {
    return this.contactService.createInquiry(createInquiryDto);
  }

  // Admin endpoints can be added here with proper guards
  @Get('inquiries')
  @ApiOperation({ summary: 'Get all contact inquiries (Admin only)' })
  async findAll() {
    return this.contactService.getAllInquiries();
  }

  @Get('inquiries/:id')
  @ApiOperation({ summary: 'Get an inquiry by ID' })
  async findOne(@Param('id') id: string) {
    return this.contactService.getInquiryById(id);
  }

  @Patch('inquiries/:id/status')
  @ApiOperation({ summary: 'Update inquiry status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.contactService.updateInquiryStatus(id, status);
  }
}
