import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { KanbanService } from './kanban.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsOptional, IsHexColor, IsArray } from 'class-validator';
import type { JwtPayload } from '@wpp-recebo/shared';

class MoveConversationDto {
  @IsString()
  declare columnId: string;
}

class CreateColumnDto {
  @IsString()
  declare name: string;

  @IsString()
  declare color: string;
}

class UpdateColumnDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

class ReorderColumnsDto {
  @IsArray()
  @IsString({ each: true })
  declare orderedIds: string[];
}

@Controller('kanban')
export class KanbanController {
  constructor(private readonly kanban: KanbanService) {}

  @Get()
  getBoard(@CurrentUser() user: JwtPayload) {
    return this.kanban.getBoard(user.tenantId);
  }

  @Patch('conversations/:id/move')
  moveConversation(
    @Param('id') id: string,
    @Body() dto: MoveConversationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.kanban.moveConversation(id, dto.columnId, user.tenantId);
  }

  // ── Columns ───────────────────────────────────────────────────────────────

  @Get('columns')
  getColumns(@CurrentUser() user: JwtPayload) {
    return this.kanban.getColumns(user.tenantId);
  }

  @Post('columns')
  createColumn(@Body() dto: CreateColumnDto, @CurrentUser() user: JwtPayload) {
    return this.kanban.createColumn(user.tenantId, dto);
  }

  @Patch('columns/reorder')
  reorderColumns(@Body() dto: ReorderColumnsDto, @CurrentUser() user: JwtPayload) {
    return this.kanban.reorderColumns(user.tenantId, dto.orderedIds);
  }

  @Patch('columns/:id')
  updateColumn(
    @Param('id') id: string,
    @Body() dto: UpdateColumnDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.kanban.updateColumn(id, user.tenantId, dto);
  }

  @Delete('columns/:id')
  deleteColumn(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.kanban.deleteColumn(id, user.tenantId);
  }
}
