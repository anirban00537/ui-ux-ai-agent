import { Controller, All, Req, Res } from '@nestjs/common';
import { getAuth } from './auth-lib';
import { Public } from 'src/shared/decorators/public.decorator';

@Controller('auth')
export class BetterAuthController {
  @Public()
  @All('*')
  async handleAuth(@Req() req: any, @Res() res: any) {
    const { toNodeHandler } = await import('better-auth/node');
    const auth = await getAuth();
    return toNodeHandler(auth)(req, res);
  }
}
