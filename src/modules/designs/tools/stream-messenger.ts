import { Observer } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';
import { StreamUpdate } from '../schemas';

/**
 * StreamMessenger handles emitting stream updates to the client
 * and optionally persisting messages to the database.
 * 
 * Optimized with fire-and-forget for non-critical DB writes to avoid blocking the stream.
 */
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

  /**
   * Emit a stream update to the client.
   * 
   * @param update - The stream update payload
   * @param msg - Optional message to persist (fire-and-forget, non-blocking)
   * @param persist - Whether to persist the message (default: true for non-empty msg)
   */
  async emit(update: StreamUpdate, msg?: string, persist: boolean = true): Promise<void> {
    // Always emit immediately to the observer - this is the critical path
    this.observer.next(update);

    // Persist message asynchronously (fire-and-forget) if needed
    if (msg && persist) {
      // Don't await - let it run in background
      this.persistMessage(msg, update.type).catch((err) => {
        console.error('[StreamMessenger] Failed to persist message:', err);
      });
    }
  }

  /**
   * Emit without persisting to DB (for high-frequency updates like streaming chunks)
   */
  emitFast(update: StreamUpdate): void {
    this.observer.next(update);
  }

  /**
   * Persist a message to the database (internal helper)
   */
  private async persistMessage(content: string, status: string): Promise<void> {
    await this.prisma.message.create({
      data: {
        designId: this.designId,
        role: 'assistant',
        content,
        status,
      },
    });
  }

  /**
   * Batch persist multiple messages (for efficiency at end of operation)
   */
  async persistMessageBatch(
    messages: Array<{ content: string; status: string }>,
  ): Promise<void> {
    if (messages.length === 0) return;

    await this.prisma.message.createMany({
      data: messages.map((m) => ({
        designId: this.designId,
        role: 'assistant',
        content: m.content,
        status: m.status,
      })),
    });
  }
}
