import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
    const secret = req.headers['x-admin-secret'];
    const adminSecret = this.config.get<string>('ADMIN_SECRET');

    if (!adminSecret || !secret || secret !== adminSecret) {
      throw new UnauthorizedException('Credenciais de administrador inválidas');
    }

    return true;
  }
}
