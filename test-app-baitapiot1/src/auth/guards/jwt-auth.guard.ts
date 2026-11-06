import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// AuthGuard: Thành phần do @nestjs/passport cung cấp để kích hoạt một Passport Strategy.

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){}

