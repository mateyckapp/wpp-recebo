import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  declare name: string;

  @IsEmail({}, { message: 'Email inválido' })
  declare email: string;

  @IsString()
  @MinLength(8, { message: 'A password deve ter pelo menos 8 caracteres' })
  @MaxLength(128)
  declare password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  declare companyName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, { message: 'Subdomínio só pode conter letras minúsculas, números e hífens' })
  declare slug: string;
}
