import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  CanActivate,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { getAuth } from 'src/modules/auth/auth-lib';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService, // Inject properly
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // For public endpoints, try to set user if session exists (optional auth)
    // but don't require it
    if (isPublic) {
      if (session) {
        const fullUser = await this.prisma.user.findUnique({
          where: { id: session.user.id },
        });
        if (fullUser) {
          request.user = fullUser;
          (request as any).session = session.session;
        }
      }
      return true;
    }

    // For protected endpoints, require authentication
    if (!session) {
      throw new UnauthorizedException();
    }

    // Fetch full user from database including role field
    const fullUser = await this.prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!fullUser) {
      throw new UnauthorizedException();
    }

    // Attach full user (with role) to request for use in controllers
    request.user = fullUser;
    (request as any).session = session.session;

    return true;
  }
}
