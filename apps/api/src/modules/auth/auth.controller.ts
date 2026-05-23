import {
  Controller,
  Post,
  Patch,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';
import { LoginResponseDto } from './dto/auth-response.dto';
import { Public } from './decorators/public.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '@wpp-recebo/shared';

class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  currentPassword?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  newPassword?: string;
}

const isDev = process.env['NODE_ENV'] !== 'production';
// Em dev: domain='localhost' cobre demo.localhost, empresa.localhost, etc.
// Em prod: APP_COOKIE_DOMAIN='.wpprecebo.pt' cobre todos os subdomínios do tenant
const cookieDomain = isDev ? 'localhost' : (process.env['APP_COOKIE_DOMAIN'] ?? undefined);

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: !isDev,
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
  path: '/',
  ...(cookieDomain ? { domain: cookieDomain } : {}),
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar utilizador' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const { refreshToken, ...response } = await this.authService.login(dto);

    res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS);

    return response;
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token via refresh token (cookie)' })
  async refresh(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const result = await this.authService.refresh(user);
    return result;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Terminar sessão' })
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie('refresh_token', { path: '/' });
  }

  @Post('issue-refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Emitir refresh token para sincronização de sessão cross-subdomain' })
  async issueRefresh(@CurrentUser() user: JwtPayload): Promise<{ refreshToken: string }> {
    const refreshToken = await this.authService.issueRefreshToken(user);
    return { refreshToken };
  }

  @Public()
  @Get('check-subdomain')
  @ApiOperation({ summary: 'Verificar disponibilidade de subdomínio' })
  checkSubdomain(@Query('slug') slug: string) {
    return this.authService.checkSubdomain(slug ?? '');
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registar novo negócio' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const { refreshToken, ...response } = await this.authService.register(dto);
    res.cookie('refresh_token', refreshToken, COOKIE_OPTIONS);
    return response;
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperação de password' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Redefinir password com token' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(dto.token, dto.password);
  }

  @Public()
  @Get('verify-email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Verificar email com token' })
  async verifyEmail(@Query('token') token: string): Promise<void> {
    await this.authService.verifyEmail(token ?? '');
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reenviar email de verificação' })
  async resendVerification(@CurrentUser() user: JwtPayload): Promise<void> {
    await this.authService.resendVerification(user.sub);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter utilizador autenticado' })
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil do utilizador autenticado' })
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(user.sub, dto);
  }
}
