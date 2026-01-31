import { PrismaService } from '../../../prisma/prisma.service';
import { CreditManager } from '../credit-manager';

export class ArtboardDeleter {
  constructor(
    private prisma: PrismaService,
    private creditManager: CreditManager,
  ) {}

  /**
   * Delete an artboard and deduct minimal credits for the operation
   */
  async deleteArtboard(
    artboardId: string,
    userId: string,
    designId: string,
  ): Promise<void> {
    // Delete operations cost minimal tokens (just the API overhead)
    const usage = {
      inputTokens: 50,
      outputTokens: 50,
      totalTokens: 100,
    };

    try {
      // Delete the artboard
      await this.prisma.artboard.delete({
        where: { id: artboardId },
      });

      console.log(
        `[ArtboardDeleter] Deleted artboard ${artboardId}, deducting credits`,
      );

      // Deduct credits for the delete operation
      await this.creditManager.deductCredits(
        userId,
        designId,
        'screen_deletion',
        usage,
      );

      console.log(
        `[ArtboardDeleter] Successfully deleted artboard and deducted credits`,
      );
    } catch (error) {
      console.error(`[ArtboardDeleter] Error deleting artboard:`, error);
      throw error;
    }
  }

  /**
   * Get an artboard by ID
   */
  async getArtboardById(artboardId: string) {
    return await this.prisma.artboard.findUnique({
      where: { id: artboardId },
    });
  }
}

export default ArtboardDeleter;
