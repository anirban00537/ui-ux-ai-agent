import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async createInquiry(dto: CreateInquiryDto) {
    const inquiry = await this.prisma.contactInquiry.create({
      data: {
        name: dto.name,
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
        metadata: dto.metadata || {},
      },
    });

    // Potential extension: Send an email notification to admin
    // this.emailService.sendAdminNotification(inquiry);

    return {
      success: true,
      message: 'Inquiry submitted successfully',
      data: inquiry,
    };
  }

  async getAllInquiries() {
    return this.prisma.contactInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInquiryById(id: string) {
    return this.prisma.contactInquiry.findUnique({
      where: { id },
    });
  }

  async updateInquiryStatus(id: string, status: string) {
    return this.prisma.contactInquiry.update({
      where: { id },
      data: { status },
    });
  }
}
