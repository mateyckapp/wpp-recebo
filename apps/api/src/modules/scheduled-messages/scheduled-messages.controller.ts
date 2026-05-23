import { Controller, Get, Post, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { ScheduledMessagesService } from './scheduled-messages.service';
import { PlanLimitsService } from '../plan-limits/plan-limits.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsNotEmpty, MaxLength, IsDateString } from 'class-validator';
import type { JwtPayload } from '@wpp-recebo/shared';

class CreateScheduledMessageDto {
  @IsString() @IsNotEmpty()
  declare conversationId: string;

  @IsString() @IsNotEmpty() @MaxLength(4096)
  declare content: string;

  @IsDateString()
  declare scheduledFor: string;
}

@Controller('scheduled-messages')
export class ScheduledMessagesController {
  constructor(
    private readonly service: ScheduledMessagesService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  @Get()
  async findAll(@CurrentUser() user: JwtPayload) {
    await this.planLimits.assertScheduledMessagesEnabled(user.tenantId);
    return this.service.findAll(user.tenantId);
  }

  @Post()
  async create(@Body() dto: CreateScheduledMessageDto, @CurrentUser() user: JwtPayload) {
    await this.planLimits.assertScheduledMessagesEnabled(user.tenantId);
    return this.service.create(
      user.tenantId,
      dto.conversationId,
      dto.content,
      new Date(dto.scheduledFor),
    );
  }

  @Delete(':id')
  @HttpCode(200)
  async cancel(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.planLimits.assertScheduledMessagesEnabled(user.tenantId);
    return this.service.cancel(id, user.tenantId);
  }
}
