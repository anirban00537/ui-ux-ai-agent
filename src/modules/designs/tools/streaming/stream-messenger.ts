import { Observer } from 'rxjs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { StreamUpdate } from '../../schemas';

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
   * @param data - Optional JSON payload to store on Message.data (e.g. title, kind, screenId)
   */
  async emit(
    update: StreamUpdate,
    msg?: string,
    persist: boolean = true,
    data?: Record<string, unknown>,
  ): Promise<void> {
    // Always emit immediately to the observer - this is the critical path
    this.observer.next(update);

    // Persist message asynchronously (fire-and-forget) if needed
    if (msg && persist) {
      const payloadData =
        data ?? (update.data as Record<string, unknown> | undefined);
      this.persistMessage(msg, update.type, payloadData).catch((err) => {
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
  private async persistMessage(
    content: string,
    status: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    const payload =
      data != null && Object.keys(data).length > 0
        ? { data: data as Prisma.InputJsonValue }
        : {};
    await this.prisma.message.create({
      data: {
        designId: this.designId,
        role: 'assistant',
        content,
        status,
        ...payload,
      },
    });
  }

  /**
   * Create a message with optional data and return its id. Used for screen_start so the
   * frontend can correlate the same card when screen_complete/screen_update is emitted.
   */
  async createMessageAndGetId(
    content: string,
    status: string,
    data?: Record<string, unknown>,
  ): Promise<string> {
    const payload =
      data != null && Object.keys(data).length > 0
        ? { data: data as Prisma.InputJsonValue }
        : {};
    const message = await this.prisma.message.create({
      data: {
        designId: this.designId,
        role: 'assistant',
        content,
        status,
        ...payload,
      },
    });
    return message.id;
  }

  /**
   * Update an existing message by id. Used for screen_complete/screen_update to update
   * the message created at screen_start.
   */
  async updateMessage(
    messageId: string,
    content: string,
    status: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        status,
        ...(data != null ? { data: data as Prisma.InputJsonValue } : {}),
      },
    });
  }

  /**
   * Batch persist multiple messages (for efficiency at end of operation)
   */
  async persistMessageBatch(
    messages: Array<{
      content: string;
      status: string;
      data?: Record<string, unknown>;
    }>,
  ): Promise<void> {
    if (messages.length === 0) return;

    await this.prisma.message.createMany({
      data: messages.map((m) => ({
        designId: this.designId,
        role: 'assistant',
        content: m.content,
        status: m.status,
        ...(m.data != null && Object.keys(m.data).length > 0
          ? { data: m.data as Prisma.InputJsonValue }
          : {}),
      })),
    });
  }
}
