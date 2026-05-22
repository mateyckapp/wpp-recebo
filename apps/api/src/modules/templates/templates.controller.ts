import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsNotEmpty, MaxLength, Matches } from 'class-validator';
import type { JwtPayload } from '@wpp-recebo/shared';

class CreateTemplateDto {
  @IsString() @IsNotEmpty() @MaxLength(60)
  declare name: string;

  @IsString() @IsNotEmpty() @MaxLength(30)
  @Matches(/^[a-z0-9_-]+$/, { message: 'Atalho só pode conter letras minúsculas, números, _ e -' })
  declare shortcut: string;

  @IsString() @IsNotEmpty() @MaxLength(4096)
  declare content: string;
}

class UpdateTemplateDto {
  @IsString() @IsNotEmpty() @MaxLength(60)
  declare name?: string;

  @IsString() @IsNotEmpty() @MaxLength(30)
  @Matches(/^[a-z0-9_-]+$/, { message: 'Atalho só pode conter letras minúsculas, números, _ e -' })
  declare shortcut?: string;

  @IsString() @IsNotEmpty() @MaxLength(4096)
  declare content?: string;
}

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templates: TemplatesService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.templates.findAll(user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateTemplateDto, @CurrentUser() user: JwtPayload) {
    return this.templates.create(user.tenantId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.templates.update(id, user.tenantId, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.templates.remove(id, user.tenantId);
  }
}
