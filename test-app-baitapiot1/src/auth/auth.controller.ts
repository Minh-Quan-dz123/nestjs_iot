
import {
  Body,
  Controller,
  Post, HttpCode,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register
  @ApiOperation({
    summary: 'Đăng ký tài khoản',
  })
  @ApiCreatedResponse({
    description: 'Đăng ký thành công',
  })
  @ApiConflictResponse({
    description: 'Email đã tồn tại',
  })
  @Post('register')
  register(@Body() dto: RegisterDto) 
  {
    return this.authService.register(dto);
  }

  // POST /auth/login
  @ApiOperation({
    summary: 'Đăng nhập và nhận JWT',
  })
  @ApiOkResponse({
    description: 'Đăng nhập thành công',
    schema: {
      example: {
        access_token: 'eyJhbGciOi...',
        token_type: 'Bearer',
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Email hoặc mật khẩu không đúng',
  })
  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto) 
  {
    return this.authService.login(dto);
  }
}
