import { PrismaService } from '../../modules/prisma/prisma.service';
import { ResponseModel } from '../models/response.model';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Prisma } from '@prisma/client';
const crypto = require('crypto');
import * as bcrypt from 'bcrypt';
import { MyLogger } from '../../modules/logger/logger.service';
import { async } from 'rxjs';
export let app: NestExpressApplication;
export let PrismaClient: PrismaService;
export let myLogger;

export async function setApp(nestapp) {
  app = nestapp;

  PrismaClient = app.get(PrismaService);
  myLogger = await app.resolve(MyLogger);
}
export function createUniqueCode() {
  let date = new Date().getTime();
  const id = crypto.randomBytes(10).toString('hex');
  const data = id + date;
  return data;
}

export async function hashedPassword(password: string) {
  const saltOrRounds = 10;
  const hashPassword = await bcrypt.hash(password, saltOrRounds);
  return hashPassword;
}

export const successResponse = (message: string, data?: any): ResponseModel => {
  return {
    success: true,
    message,
    data,
  };
};

export const processException = (error: any): ResponseModel => {
  return {
    success: false,
    message: error.message || 'An error occurred',
    data: null,
  };
};

function checkPrismaError(e) {
  if (
    e instanceof Prisma.PrismaClientKnownRequestError ||
    e instanceof Prisma.PrismaClientUnknownRequestError
  ) {
    console.error(e.stack);
    throw new Error('Something went wrong.');
  }
}

export function errorResponse(msg?: string, data?: object): ResponseModel {
  return {
    success: false,
    message: msg ?? 'Response Error!',
    data: data || null,
  };
}

export function generateMailKey() {
  return generateNDigitNumber(6);
}

function generateNDigitNumber(n) {
  return Math.floor(
    Math.pow(10, n - 1) + Math.random() * 9 * Math.pow(10, n - 1),
  );
}

export function addDayWithCurrentDate(dayCount: number) {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + dayCount);
  return currentDate;
}

export function clearTrailingSlash(str: string) {
  return str.replace(/\/$/, '');
}

export function exchange_app_url() {
  return clearTrailingSlash(process.env.EXCHANGE_APP_URL ?? '');
}

export function base_url() {
  return clearTrailingSlash(process.env.APP_URL ?? '');
}

export function envAppName() {
  return process.env.APP_NAME || '';
}

export async function appName(): Promise<string> {
  return process.env.APP_NAME || '';
}

export async function emailAppName(): Promise<string> {
  const app_name = await appName();
  return app_name ? '[' + app_name + ']' : '';
}

export async function formatLimitOffset(payload: any) {
  let limit = payload.limit ? Math.abs(parseInt(payload.limit)) : 10;
  // Support 'page' as an alias for 'offset', defaulting to 1
  let pageParam = payload.page || payload.offset;
  let offset = pageParam ? Math.abs(parseInt(pageParam)) : 1;

  limit = isNaN(limit) ? 10 : limit;
  limit = limit > 0 ? limit : 10;

  offset = isNaN(offset) ? 1 : offset;
  offset = offset > 0 ? offset : 1;

  return {
    limit,
    offset,
  };
}

export async function paginatioOptions(payload: any) {
  const limitOffset = await formatLimitOffset(payload);
  const limit = limitOffset.limit;
  const offset = limitOffset.offset;
  let skip = 0;
  if (limit > 0 && offset > 0) {
    skip = (offset - 1) * limit;
  }

  const data = {
    skip,
    take: limit,
  };

  return data;
}

export async function paginationMetaData(
  model: string,
  payload: any,
  totalCount?: number,
) {
  const total =
    totalCount !== undefined ? totalCount : await PrismaClient[model].count();

  const limitOffset = await formatLimitOffset(payload);

  const lastPage = Math.ceil(total / limitOffset.limit);
  const data = {
    total: total,
    lastPage: lastPage,
    currentPage: limitOffset.offset,
    perPage: limitOffset.limit,
    prev: limitOffset.offset > 1 ? limitOffset.offset - 1 : null,
    next: limitOffset.offset < lastPage ? limitOffset.offset + 1 : null,
  };

  return data;
}

/**
 * Sanitize error messages for frontend display
 * Converts technical errors into user-friendly messages
 * @param error - The error object or message to sanitize
 * @returns User-friendly error message string
 */
export function sanitizeErrorForFrontend(error: any): string {
  const message = error?.message || String(error) || '';
  
  // Map technical errors to user-friendly messages
  if (message.includes('JSON') || message.includes('parse') || message.includes('Unterminated')) {
    return 'We encountered a temporary issue. Please try again.';
  }
  if (message.includes('token') || message.includes('limit') || message.includes('length')) {
    return 'The content was too long to process. Try a simpler approach.';
  }
  if (message.includes('timeout') || message.includes('ECONNRESET') || message.includes('network')) {
    return 'Connection issue. Please check your internet and try again.';
  }
  if (message.includes('rate limit') || message.includes('429')) {
    return 'Service is busy. Please wait a moment and try again.';
  }
  if (message.includes('API') || message.includes('OpenAI') || message.includes('OpenRouter')) {
    return 'AI service temporarily unavailable. Please try again shortly.';
  }
  if (message.includes('not found') || message.includes('Doc not found') || message.includes('Card not found')) {
    return 'Resource not found. It may have been deleted.';
  }
  if (message.includes('outline') || message.includes('No cards')) {
    return 'Please add an outline before generating cards.';
  }
  if (message.includes('credit') || message.includes('subscription') || message.includes('Insufficient')) {
    return 'Please check your subscription or credits to continue.';
  }
  if (message.includes('layout') || message.includes('No layouts')) {
    return 'No layouts available. Please contact support.';
  }
  if (message.includes('Unauthorized') || message.includes('permission')) {
    return 'You do not have permission to perform this action.';
  }
  
  // Default fallback - generic user-friendly message
  return 'Something went wrong. Please try again.';
}
