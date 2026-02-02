import { PrismaService } from '../../prisma/prisma.service';
import { ExistingArtboard, PreviousScreenContext } from '../schemas';
import { StreamMessenger } from '../tools/streaming';
import { coreConstant } from '../../../shared/helpers/coreConstant';

export interface ChatDesign {
  id: string;
  type: string | null;
  colorPalette: unknown;
}

export interface ChatContext {
  design: ChatDesign;
  designId: string;
  contextMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  existingArtboards: ExistingArtboard[];
  getLastScreensForDesignPattern: (
    artboards: Array<{ title: string; description: string | null; html: string }>,
  ) => PreviousScreenContext[];
}

const maxContext = coreConstant.DESIGN_CONTEXT.MAX_PREVIOUS_SCREENS;

/**
 * Returns previous screens for design-pattern context. Always includes the FIRST screen
 * (design anchor) so later screens stay consistent with the original design; plus the
 * most recent screens up to maxContext total. This prevents design drift as screen count grows.
 */
function buildGetLastScreensForDesignPattern(): (
  artboards: Array<{ title: string; description: string | null; html: string }>,
) => PreviousScreenContext[] {
  return (artboards) => {
    if (artboards.length === 0) return [];
    if (artboards.length <= maxContext)
      return artboards.map((a) => ({
        title: a.title,
        description: a.description ?? null,
        html: a.html,
      }));
    const first = artboards[0];
    const lastNMinusOne = artboards.slice(-(maxContext - 1));
    const combined = [
      { title: first.title, description: first.description ?? null, html: first.html },
      ...lastNMinusOne.map((a) => ({
        title: a.title,
        description: a.description ?? null,
        html: a.html,
      })),
    ];
    return combined;
  };
}

/**
 * Validates prompt/userId, loads or creates design, persists user message,
 * loads messages and artboards, builds context. Returns null if validation
 * or design load failed (caller already emitted and should complete).
 */
export async function buildChatContext(
  prisma: PrismaService,
  messenger: StreamMessenger,
  prompt: string,
  userId: string,
  designId: string,
): Promise<ChatContext | null> {
  if (!prompt) {
    await messenger.emit(
      { type: coreConstant.STREAM_EVENT.STATUS_UPDATE },
      'Prompt is required',
    );
    return null;
  }
  if (!userId) {
    await messenger.emit(
      { type: coreConstant.STREAM_EVENT.STATUS_UPDATE },
      'User ID is required',
    );
    return null;
  }

  let design: ChatDesign | null = null;
  let resolvedDesignId = designId;

  if (designId) {
    const found = await prisma.design.findUnique({
      where: { id: designId, userId },
    });
    if (!found) {
      await messenger.emit(
        { type: coreConstant.STREAM_EVENT.STATUS_UPDATE },
        'Design not found',
      );
      return null;
    }
    design = {
      id: found.id,
      type: found.type,
      colorPalette: found.colorPalette,
    };
    resolvedDesignId = found.id;
  } else {
    const created = await prisma.design.create({
      data: { userId },
    });
    design = {
      id: created.id,
      type: created.type,
      colorPalette: created.colorPalette,
    };
    resolvedDesignId = created.id;
    messenger.setDesignId(resolvedDesignId);
  }

  await prisma.message.create({
    data: { designId: resolvedDesignId, role: 'user', content: prompt },
  });

  const messages = await prisma.message.findMany({
    where: { designId: resolvedDesignId },
    orderBy: { createdAt: 'asc' },
  });
  const contextMessages = messages.map((m) => ({
    role: m.role as 'system' | 'user' | 'assistant',
    content: m.content,
  }));

  const existingArtboards = (await prisma.artboard.findMany({
    where: { designId: resolvedDesignId },
    orderBy: { createdAt: 'asc' },
  })) as ExistingArtboard[];

  const getLastScreensForDesignPattern = buildGetLastScreensForDesignPattern();

  return {
    design,
    designId: resolvedDesignId,
    contextMessages,
    existingArtboards,
    getLastScreensForDesignPattern,
  };
}
