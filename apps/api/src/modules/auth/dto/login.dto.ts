import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@demo.wpprecebo.pt' })
  @IsEmail({}, { message: 'Email inválido' })
  declare email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8, { message: 'A password deve ter pelo menos 8 caracteres' })
  declare password: string;
}
