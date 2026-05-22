import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '@wpp-recebo/shared';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

class CreateCampaignDto {
  @IsString() @IsNotEmpty() @MaxLength(100) declare name: string;
  @IsString() @IsNotEmpty() @MaxLength(4096) declare message: string;
  @IsString() @IsNotEmpty() declare groupId: string;
}

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.campaigns.findAll(user.tenantId);
  }

  @Get(':id')
  findById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.campaigns.findById(id, user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateCampaignDto, @CurrentUser() user: JwtPayload) {
    return this.campaigns.create(user.tenantId, dto);
  }

  @Post(':id/send')
  send(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.campaigns.startSending(id, user.tenantId);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.campaigns.cancel(id, user.tenantId);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.campaigns.delete(id, user.tenantId);
  }
}
