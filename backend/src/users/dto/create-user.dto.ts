import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsUUID } from 'class-validator';
import { UserRole } from '../../common/enums';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsUUID()
  clientId?: string;
}
