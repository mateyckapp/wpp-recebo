import { Controller, Get, Patch, Post, Body } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '@wpp-recebo/shared';
import { IsOptional, IsString, IsNotEmpty, MaxLength, IsUrl, Matches } from 'class-validator';

class UpdateBrandingDto {
  @IsOptional()
  @IsUrl()
  logoUrl?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Cor deve ser um hex válido (#RRGGBB)' })
  primaryColor?: string;
}

class UpdateWhatsappDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  whatsappPhoneNumberId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  whatsappBusinessAccountId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(512)
  whatsappAccessToken?: string;
}

@Controller('settings')
export class TenantsController {
  constructor(private readonly tenants: TenantsService) {}

  @Get()
  getSettings(@CurrentUser() user: JwtPayload) {
    return this.tenants.getSettings(user.tenantId);
  }

  @Patch('whatsapp')
  updateWhatsapp(@Body() dto: UpdateWhatsappDto, @CurrentUser() user: JwtPayload) {
    return this.tenants.updateWhatsappSettings(user.tenantId, user.role, dto);
  }

  @Get('onboarding')
  getOnboarding(@CurrentUser() user: JwtPayload) {
    return this.tenants.getOnboardingStatus(user.tenantId);
  }

  @Post('whatsapp/test')
  testWhatsapp(@CurrentUser() user: JwtPayload) {
    return this.tenants.testWhatsappConnection(user.tenantId);
  }

  @Get('branding')
  getBranding(@CurrentUser() user: JwtPayload) {
    return this.tenants.getBranding(user.tenantId);
  }

  @Patch('branding')
  updateBranding(@Body() dto: UpdateBrandingDto, @CurrentUser() user: JwtPayload) {
    return this.tenants.updateBranding(user.tenantId, dto);
  }
}
