import { Observer } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { StreamUpdate } from '../schemas';

export class StreamMessenger {
  private designId: string;
  private prisma: PrismaService;
  private observer: Observer<StreamUpdate>;

  constructor(
    prisma: PrismaService,
    observer: Observer<StreamUpdate>,
    designId: string,
  ) {
    this.prisma = prisma;
    this.observer = observer;
    this.designId = designId;
  }

  setDesignId(id: string) {
    this.designId = id;
  }

  async emit(update: StreamUpdate, msg?: string): Promise<void> {
    this.observer.next(update);
    if (msg) {
      await this.prisma.message.create({
        data: {
          designId: this.designId,
          role: 'assistant',
          content: msg,
          status: update.type,
        },
      });
    }
  }
}
