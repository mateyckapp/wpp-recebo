import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { CloudflareModule } from '../cloudflare/cloudflare.module';
import { ApiKeyOrJwtGuard } from '../../common/guards/api-key-or-jwt.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}), // secrets configurados por strategy
    UsersModule,
    PrismaModule,
    CloudflareModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    // Guard global — todas as rotas protegidas por defeito (JWT ou API Key)
    // Usar @Public() para rotas públicas
    {
      provide: APP_GUARD,
      useClass: ApiKeyOrJwtGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
