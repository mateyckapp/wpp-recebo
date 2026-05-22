import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '@wpp-recebo/shared';
import { UserRole } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsEnum,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';

class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  declare name: string;

  @IsEmail()
  declare email: string;

  @IsEnum([UserRole.AGENT, UserRole.ADMIN])
  declare role: UserRole;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  declare password: string;
}

class UpdateAgentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEnum([UserRole.AGENT, UserRole.ADMIN])
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

function requireOwnerOrAdmin(role: string): void {
  if (role !== UserRole.OWNER && role !== UserRole.ADMIN) {
    throw new ForbiddenException('Sem permissão para gerir utilizadores');
  }
}

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.users.findAll(user.tenantId);
  }

  @Post()
  create(@Body() dto: CreateAgentDto, @CurrentUser() user: JwtPayload) {
    requireOwnerOrAdmin(user.role);
    return this.users.createAgent(user.tenantId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAgentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    requireOwnerOrAdmin(user.role);
    return this.users.updateAgent(id, user.tenantId, user.sub, user.role as UserRole, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    if (user.role !== UserRole.OWNER) {
      throw new ForbiddenException('Apenas o dono pode remover utilizadores');
    }
    return this.users.removeAgent(id, user.tenantId, user.sub);
  }
}
