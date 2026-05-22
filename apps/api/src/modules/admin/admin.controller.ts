import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Plan, TenantStatus } from '@prisma/client';

@Public()
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  // ── Public ─────────────────────────────────────────────────────────────────
  // Pixel IDs read by root layout — no admin auth needed, no secrets exposed

  @Get('public-config')
  getPublicConfig() {
    return this.admin.getPublicConfig();
  }

  // ── Protected ─────────────────────────────────────────────────────────────

  @UseGuards(AdminGuard)
  @Get('stats')
  getStats() {
    return this.admin.getStats();
  }

  @UseGuards(AdminGuard)
  @Get('tenants')
  getTenants(@Query('search') search?: string) {
    return this.admin.getTenants(search);
  }

  @UseGuards(AdminGuard)
  @Patch('tenants/:id')
  updateTenant(
    @Param('id') id: string,
    @Body() body: { plan?: Plan; status?: TenantStatus },
  ) {
    return this.admin.updateTenant(id, body);
  }

  @UseGuards(AdminGuard)
  @Get('billing')
  getBilling() {
    return this.admin.getBillingOverview();
  }

  @UseGuards(AdminGuard)
  @Get('config')
  getConfig() {
    return this.admin.getConfig();
  }

  @UseGuards(AdminGuard)
  @Post('config')
  upsertConfig(@Body() body: { key: string; value: string }) {
    return this.admin.upsertConfig(body.key, body.value);
  }
}
