import { ApiProperty } from '@nestjs/swagger';
import {IsEmail,IsString,IsNotEmpty,} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email đăng nhập',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Mật khẩu tài khoản',
    example: 'ExamplePassword123',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
