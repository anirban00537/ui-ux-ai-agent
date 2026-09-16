import { api } from '@/lib/api';

export interface CreateInquiryParams {
  name: string;
  email: string;
  subject: string;
  message: string;
  metadata?: any;
}

export const createInquiry = async (params: CreateInquiryParams) => {
  return api.post('/contact', params);
};
