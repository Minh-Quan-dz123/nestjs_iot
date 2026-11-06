import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'

import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ){}

    // 1. DKY TÀI KHOẢN
    async register(dto: RegisterDto)
    {
        // kiểm tra email tồn tại chưa
        const check = await this.prisma.user.findUnique({where: {email: dto.email}});

        if(check) throw new ConflictException('Email đã tồn tại');

        // nếu oke thì cho tạo mk vào lưu
        const hashedPass = await bcrypt.hash(dto.password, 10);

        // tạo User trong PostgreSQL
        try
        {
            return await this.prisma.user.create({
                data: {name: dto.name, email: dto.email, password: hashedPass},

                select: {id: true, name: true, email: true}
            })
        }
        catch (error)
        {
            if(error instanceof Error && 'code' in error && error.code === 'P2002') 
            {
                throw new ConflictException('Email đã tồn tại');
            }
            throw error;
        }
    }

    // 2. ĐĂNG NHẬP
    async login(dto: LoginDto)
    {
        const user = await this.prisma.user.findUnique({where: {email: dto.email}});

        if(!user || !user.password) throw new UnauthorizedException( 'Email hoặc mật khẩu không đúng');

        // nếu tìm lấy theo email rồi thì so sánh mk
        const checkpass = await bcrypt.compare(dto.password, user.password)

        if(!checkpass) throw new UnauthorizedException( 'Email hoặc mật khẩu không đúng');

        // tạo dữ iệu trong jwt
        const payload = {sub: user.id, email: user.email};

        // ký JWT
        const accessToken = await this.jwtService.signAsync(payload);

        return {access_token: accessToken, token_type: 'Bearer'}

    }
}
