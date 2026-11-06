import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule} from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtStrategy } from './strategies/jwt.strategy';


@Module({
  imports: [
    PrismaModule, 
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({imports: [ConfigModule], inject: [ConfigService],
    useFactory: (ConfigService: ConfigService) => ({
      secret: ConfigService.getOrThrow<string>('JWT_SECRET'),
      signOptions: {expiresIn: '3d'}
    })
  })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  
  // Cho phép module khác sử dụng JwtService
  exports: [JwtModule],
})
export class AuthModule {}
