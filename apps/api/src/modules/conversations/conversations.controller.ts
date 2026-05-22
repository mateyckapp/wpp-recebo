import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsIn, IsOptional } from 'class-validator';
import type { JwtPayload } from '@wpp-recebo/shared';

class UpdateStatusDto {
  @IsString()
  @IsIn(['OPEN', 'CLOSED', 'ARCHIVED'])
  declare status: string;
}

class ListConversationsQuery {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}

  @Get()
  findAll(@Query() query: ListConversationsQuery, @CurrentUser() user: JwtPayload) {
    return this.conversations.findAll(user.tenantId, {
      status: query.status,
      search: query.search,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 30),
    });
  }

  @Get(':id')
  findById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.conversations.findById(id, user.tenantId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.conversations.markAsRead(id, user.tenantId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.conversations.updateStatus(id, user.tenantId, dto.status);
  }
}
