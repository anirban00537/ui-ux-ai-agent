import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { successResponse, processException } from 'src/shared/helpers/functions';
import { ResponseModel } from 'src/shared/models/response.model';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class AdminActivityService {
  private readonly logger = new Logger(AdminActivityService.name);
  private readonly LOG_DIR = path.join(process.cwd(), 'storage', 'logs');

  constructor(private readonly prisma: PrismaService) {}

  async getSystemActivities(query: any): Promise<ResponseModel> {
    try {
      const { page = 1, perPage = 50, search, level } = query;
      
      const logs = await this.readLogs();
      
      // Filter
      let filteredLogs = logs;
      
      if (level && level !== 'all') {
         filteredLogs = filteredLogs.filter(log => log.level === level);
      }

      if (search) {
        const lowerSearch = search.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.message.toLowerCase().includes(lowerSearch) ||
          log.context.toLowerCase().includes(lowerSearch)
        );
      }

      // Sort by timestamp desc
      filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Pagination
      const total = filteredLogs.length;
      const skip = (page - 1) * perPage;
      const paginatedLogs = filteredLogs.slice(skip, skip + Number(perPage));

      // Map to frontend expectation
      const mappedActivities = paginatedLogs.map((log, index) => ({
        id: `${new Date(log.timestamp).getTime()}-${index}`,
        action: log.context.toUpperCase(),
        description: log.message,
        createdAt: log.timestamp,
        user: {
          name: 'System',
          email: 'system@butterfast.ai'
        },
        metadata: {
          level: log.level
        }
      }));

      return successResponse('System activities retrieved from storage', {
        activities: mappedActivities,
        pagination: {
          page: Number(page),
          perPage: Number(perPage),
          total,
          totalPages: Math.ceil(total / perPage),
        },
      });
    } catch (error) {
      return processException(error);
    }
  }

  async deleteLogs(level?: string): Promise<ResponseModel> {
    try {
       const filesToDelete = level && level !== 'all' 
         ? [`${level}.log`] 
         : ['info.log', 'error.log', 'warn.log', 'debug.log'];

       for (const file of filesToDelete) {
          const filePath = path.join(this.LOG_DIR, file);
          try {
             // Truncate file
             await fs.writeFile(filePath, '');
          } catch(e) {
             // Ignore if file doesn't exist
          }
       }
       
       return successResponse('Logs cleared successfully');
    } catch (error) {
       return processException(error);
    }
  }

  private async readLogs(): Promise<any[]> {
    const logFiles = ['info.log', 'error.log', 'warn.log', 'debug.log'];
    let allLogs: any[] = [];

    for (const file of logFiles) {
      try {
        const filePath = path.join(this.LOG_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            allLogs.push(parsed);
          } catch (e) {
            // Skip invalid json lines
          }
        }
      } catch (error) {
        // File might not exist, ignore
      }
    }
    return allLogs;
  }
}
