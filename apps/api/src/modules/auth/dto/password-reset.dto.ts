import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email inválido' })
  declare email: string;
}

export class ResetPasswordDto {
  @IsString()
  declare token: string;

  @IsString()
  @MinLength(8, { message: 'A password deve ter pelo menos 8 caracteres' })
  @MaxLength(128)
  declare password: string;
}
