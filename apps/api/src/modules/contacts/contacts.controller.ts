import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsOptional, IsString, IsEmail, IsNotEmpty, MaxLength, IsArray, ValidateNested, IsPhoneNumber } from 'class-validator';
import { Type } from 'class-transformer';
import type { JwtPayload } from '@wpp-recebo/shared';
import { CreateContactDto } from './contacts.service';

class ImportRowDto {
  @IsString() @IsNotEmpty() declare phoneNumber: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
}

class ImportContactsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportRowDto)
  declare rows: ImportRowDto[];
}

class ListContactsQuery {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() groupId?: string;
  @IsOptional() page?: number;
  @IsOptional() limit?: number;
}

class UpdateContactBody {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() notes?: string;
}

class CreateGroupDto {
  @IsString() @IsNotEmpty() @MaxLength(60) declare name: string;
  @IsOptional() @IsString() color?: string;
}

class UpdateGroupDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(60) name?: string;
  @IsOptional() @IsString() color?: string;
}

@ApiTags('Contacts')
@ApiBearerAuth()
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contacts: ContactsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar contactos' })
  findAll(@Query() query: ListContactsQuery, @CurrentUser() user: JwtPayload) {
    return this.contacts.findAll(user.tenantId, {
      search: query.search,
      groupId: query.groupId,
      page: Number(query.page ?? 1),
      limit: Number(query.limit ?? 30),
    });
  }

  @Post()
  @ApiOperation({ summary: 'Criar contacto' })
  create(@Body() dto: CreateContactDto, @CurrentUser() user: JwtPayload) {
    return this.contacts.createContact(user.tenantId, dto);
  }

  @Post('import')
  @ApiOperation({ summary: 'Importar contactos via CSV (JSON array)' })
  import(@Body() dto: ImportContactsDto, @CurrentUser() user: JwtPayload) {
    return this.contacts.importContacts(user.tenantId, dto.rows);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter contacto por ID' })
  findById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.contacts.findById(id, user.tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar contacto' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContactBody,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contacts.update(id, user.tenantId, dto);
  }

  // ─── Grupos ──────────────────────────────────────────────────────────────

  @Get('groups/list')
  listGroups(@CurrentUser() user: JwtPayload) {
    return this.contacts.findAllGroups(user.tenantId);
  }

  @Post('groups')
  createGroup(@Body() dto: CreateGroupDto, @CurrentUser() user: JwtPayload) {
    return this.contacts.createGroup(user.tenantId, dto);
  }

  @Patch('groups/:id')
  updateGroup(
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contacts.updateGroup(id, user.tenantId, dto);
  }

  @Delete('groups/:id')
  deleteGroup(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.contacts.deleteGroup(id, user.tenantId);
  }

  @Post('groups/:id/members/:contactId')
  addToGroup(
    @Param('id') groupId: string,
    @Param('contactId') contactId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contacts.addContactToGroup(groupId, contactId, user.tenantId);
  }

  @Delete('groups/:id/members/:contactId')
  removeFromGroup(
    @Param('id') groupId: string,
    @Param('contactId') contactId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contacts.removeContactFromGroup(groupId, contactId, user.tenantId);
  }
}
