import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ColorPalette } from '../schemas';
import { ColorPaletteGenerator } from '../tools/agents/color-palette-generator';
import { StreamMessenger } from '../tools/streaming';
import { coreConstant } from '../../../shared/helpers/coreConstant';
import type { ChatDesign } from './chat-context';

export async function runThemePhase(
  prisma: PrismaService,
  messenger: StreamMessenger,
  design: ChatDesign,
  designId: string,
  prompt: string,
  userId: string,
  colorPaletteGenerator: ColorPaletteGenerator,
  signal: AbortSignal,
): Promise<ColorPalette | null> {
  let colorPalette = (design.colorPalette as ColorPalette | null) ?? null;

  if (!colorPalette) {
    await messenger.emit(
      {
        type: coreConstant.STREAM_EVENT.PHASE_STEP,
        data: { label: 'Generating theme', status: 'started' },
      },
      'Generating theme: started',
      true,
      { label: 'Generating theme', status: 'started' },
    );

    try {
      colorPalette = await colorPaletteGenerator.generateColorPalette(
        prompt,
        userId,
        designId,
        signal,
      );
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }
      console.warn('[ColorPalette] Generation failed, using default');
      colorPalette = colorPaletteGenerator.generateDefaultColorPalette();
    }

    await prisma.design.update({
      where: { id: designId },
      data: { colorPalette: colorPalette as unknown as Prisma.InputJsonValue },
    });

    await messenger.emit(
      {
        type: coreConstant.STREAM_EVENT.PHASE_STEP,
        data: { label: 'Generating theme', status: 'completed', credits: colorPalette.credits },
      },
      'Generating theme: completed',
      true,
      { label: 'Generating theme', status: 'completed', credits: colorPalette.credits },
    );
    messenger.emitFast({
      type: coreConstant.STREAM_EVENT.PHASE_THEME_COMPLETE,
      data: colorPalette,
    });
  } else {
    messenger.emitFast({
      type: coreConstant.STREAM_EVENT.PHASE_THEME_COMPLETE,
      data: colorPalette,
    });
  }

  return colorPalette;
}
