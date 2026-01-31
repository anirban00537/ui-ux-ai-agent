import { PrismaService } from '../../../prisma/prisma.service';
import { CreditManager } from '../credit-manager';

export class ScreenDeleter {
  constructor(
    private prisma: PrismaService,
    private creditManager: CreditManager,
  ) {}

  /**
   * Delete a screen and deduct minimal credits for the operation
   */
  async deleteScreen(
    screenId: string,
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
      // Delete the screen
      await this.prisma.screen.delete({
        where: { id: screenId },
      });

      console.log(
        `[ScreenDeleter] Deleted screen ${screenId}, deducting credits`,
      );

      // Deduct credits for the delete operation
      await this.creditManager.deductCredits(
        userId,
        designId,
        'screen_deletion',
        usage,
      );

      console.log(
        `[ScreenDeleter] Successfully deleted screen and deducted credits`,
      );
    } catch (error) {
      console.error(`[ScreenDeleter] Error deleting screen:`, error);
      throw error;
    }
  }

  /**
   * Get a screen by ID
   */
  async getScreenById(screenId: string) {
    return await this.prisma.screen.findUnique({
      where: { id: screenId },
    });
  }
}

export default ScreenDeleter;
