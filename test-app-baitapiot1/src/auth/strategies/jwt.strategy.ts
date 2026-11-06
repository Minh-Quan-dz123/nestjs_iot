import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
// Strategy	    JWT Strategy do passport-jwt cung cấp
// ExtractJwt	Các phương thức hỗ trợ lấy JWT từ request

import { PrismaService } from '../../prisma/prisma.service';

interface JwtPayload {
    sub: number;
    email: string;
    iat?: number;
    exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt')
{
    constructor(
        configService: ConfigService,
        private readonly prisma: PrismaService
    )
    {
        // passport lấy từ jwt từ header loại bearer, có kiểm tra ex, có key, loại hs256
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
            algorithms: ['HS256']
        });
    }

    async validate(payload: JwtPayload)
    {
        // 1 kiểm tra dữ liệu trong jwt
        if (
            !payload || 
            !Number.isInteger(payload.sub) ||
            payload.sub <= 0 ||
            typeof payload.email !== 'string'
        ) throw new UnauthorizedException('JWT Payload không hợp lệ');
    

        // 2 tìm user trong database
        const user = await this.prisma.user.findUnique({
            where: {id: payload.sub},
            select: {
                id: true,
                email: true,
                role: true
            }
        })

        // 3. kiểm tra user có tồn tại và khớp email ko
        if(!user || (user.email !== payload.email) ) throw new UnauthorizedException('Tài khoản không hợp lệ');

        // 4. trả về thông tin user đã xác thực
        return {
            userId: user.id,
            email: user.email,
            role: user.role
        }
    }
}