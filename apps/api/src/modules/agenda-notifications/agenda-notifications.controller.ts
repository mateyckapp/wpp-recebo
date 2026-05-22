import { Controller, Get, Put, Body } from '@nestjs/common';
import { AgendaNotificationsService } from './agenda-notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsBoolean, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import type { JwtPayload } from '@wpp-recebo/shared';

class UpsertNotificationConfigDto {
  @IsOptional() @IsBoolean() confirmationEnabled?: boolean;
  @IsOptional() @IsInt() @Min(1) @Max(60) confirmationDelayMinutes?: number;
  @IsOptional() @IsString() confirmationTemplate?: string;

  @IsOptional() @IsBoolean() reminder2dEnabled?: boolean;
  @IsOptional() @IsString() reminder2dTemplate?: string;

  @IsOptional() @IsBoolean() reminder1dEnabled?: boolean;
  @IsOptional() @IsString() reminder1dTemplate?: string;

  @IsOptional() @IsBoolean() reminder2hEnabled?: boolean;
  @IsOptional() @IsString() reminder2hTemplate?: string;

  @IsOptional() @IsBoolean() reminder1hEnabled?: boolean;
  @IsOptional() @IsString() reminder1hTemplate?: string;
}

@Controller('agenda/notifications')
export class AgendaNotificationsController {
  constructor(private readonly service: AgendaNotificationsService) {}

  @Get('config')
  getConfig(@CurrentUser() user: JwtPayload) {
    return this.service.getConfig(user.tenantId);
  }

  @Put('config')
  upsertConfig(@Body() dto: UpsertNotificationConfigDto, @CurrentUser() user: JwtPayload) {
    return this.service.upsertConfig(user.tenantId, dto);
  }
}
