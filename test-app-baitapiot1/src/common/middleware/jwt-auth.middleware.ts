import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";

import { JwtService } from "@nestjs/jwt";

import type { Request, Response, NextFunction } from "express";

// kiểm dữ liệu JWT Payload
interface JwtPayload {
    sub: number;
    email: string;
    iat?: number;
    exp?: number;
}


@Injectable()
export class JwtAuthMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService) {}

    async use(req: Request, res: Response, next: NextFunction)
    {
        // Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
        // 1. lấy Authorization Header
        const authorization = req.headers.authorization;
        if(!authorization) throw new UnauthorizedException('Thiếu Authorization Header');

        // 2. kiểm tra định dạng Bearer Token
        const [type, token, extra] = authorization.split(' ');
        // type = 'Bearer';
        // token = 'eyJhbGciOiJIUzI1NiIs...';
        // extra = undefined;

        if (type !== 'Bearer' || !token || extra)  throw new UnauthorizedException('Token không đúng định dạng Bearer');

        // 3. Xác minh JWT
        let payload: JwtPayload;
        try 
        { // verifyAsync() kiểm tra chữ ký JWT bằng secret đã cấu hình, đồng thời kiểm tra các điều kiện như thời hạn hết hạn exp.
            payload = await this.jwtService.verifyAsync<JwtPayload>(token);

            // nếu thành công payload được gán
            // {
            //     "sub": 1,
            //     "email": "a@gmail.com",
            //     "iat": 1793080000,
            //     "exp": 1793684800
            // }
        }
        catch
        {
            throw new UnauthorizedException('JWT không hợp lệ hoặc đã hết hạn');
        }

        // 4. Kiểm tra dữ liệu định danh trong payload
        if(!Number.isInteger(payload.sub) || payload.sub <= 0 || typeof payload.email !== 'string')
        {
            throw new UnauthorizedException('JWT Payload không hợp lệ');
        }

        // 5. gắn thông tin user vào request
        Object.assign(req, {user: {userId: payload.sub, email: payload.email}});

        // 6. Chuyển request tới bước tiếp theo
        next();
    
    }
}