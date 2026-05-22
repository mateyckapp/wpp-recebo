import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class AuthUserDto {
  @ApiProperty()
  declare id: string;

  @ApiProperty()
  declare email: string;

  @ApiProperty()
  declare name: string;

  @ApiProperty({ enum: UserRole })
  declare role: UserRole;

  @ApiProperty()
  declare tenantId: string;

  @ApiProperty()
  declare tenantSlug: string;
}

export class LoginResponseDto {
  @ApiProperty()
  declare accessToken: string;

  @ApiProperty()
  declare user: AuthUserDto;
}
