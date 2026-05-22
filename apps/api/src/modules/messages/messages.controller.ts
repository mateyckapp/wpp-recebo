import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '@wpp-recebo/shared';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  declare text: string;
}

@Controller('conversations/:conversationId/messages')
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get()
  getMessages(
    @Param('conversationId') conversationId: string,
    @CurrentUser() user: JwtPayload,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messages.getMessages(
      conversationId,
      user.tenantId,
      cursor,
      limit ? parseInt(limit, 10) : 30,
    );
  }

  @Post()
  sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.messages.sendMessage(conversationId, user.tenantId, user.sub, dto.text);
  }
}
