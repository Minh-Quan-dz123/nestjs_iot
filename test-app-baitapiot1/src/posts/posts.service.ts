
import {Injectable, ForbiddenException, NotFoundException,} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import type { UserRole } from '../common/interfaces/authenticated-request.interface';

@Injectable()
export class PostsService 
{
    constructor(private readonly prisma: PrismaService,) {}

    // KIỂM TRA QUYỀN SỬA / XÓA POST
    private async checkPostPermission(postId: number, userId: number, role: UserRole) 
    {
        // 1. Tìm bài viết
        const post = await this.prisma.post.findUnique({
            where: { id: postId },
            select: { userId: true }
        });

        // 2. Kiểm tra bài viết có tồn tại không
        if (!post) { throw new NotFoundException('Post không tồn tại');}

        // 3. Nếu không phải Admin và không phải chủ bài viết thì từ chối
        if (role !== 'admin' && post.userId !== userId) 
        {
            throw new ForbiddenException('Bạn không có quyền sửa hoặc xóa bài viết này');
        }
    }

    // 1. TẠO POST
    async create(userId: number, dto: CreatePostDto)
    {
        // Kiểm tra User có tồn tại không
        const user = await this.prisma.user.findUnique({where: { id: userId },});

        if (!user) throw new NotFoundException('User không tồn tại');

        // Tạo Post và liên kết với User
        return this.prisma.post.create({
        data: {
            title: dto.title,
            content: dto.content,
            user: {
            connect: { id: userId},
            },
        },
        });
    }

    // 2. LẤY TẤT CẢ POST
    async findAll() 
    {
        return this.prisma.post.findMany({
        include: {
            user: {
            select: {
                id: true,
                name: true,
                email: true,
            },
            },
        },
        });
    }

    // 3. LẤY POST THEO ID
    async findOne(id: number) 
    {
        const post = await this.prisma.post.findUnique({
        where: { id },
        include: {
            user: {
            select: {id: true, name: true,email: true,},
            },
        },
        });

        if (!post)  throw new NotFoundException('Post không tồn tại');
        
        return post;
    }

    // 4. LẤY TẤT CẢ POST CỦA MỘT USER
    async findByUserId(userId: number) 
    {
        const user = await this.prisma.user.findUnique({ where: { id: userId },});
        if (!user) throw new NotFoundException('User không tồn tại');
        
        return this.prisma.post.findMany({where: { userId }});
    }

    // 5. CẬP NHẬT POST
    async update(id: number, userId: number, role: UserRole, dto: UpdatePostDto) 
    {
        // Kiểm tra quyền
        await this.checkPostPermission(id, userId, role);


        return this.prisma.post.update({
            where: { id },
            data: {
                title: dto.title,
                content: dto.content,
            },
        });
    }

    // 6. XÓA POST
    async remove(id: number, userId: number, role: UserRole) 
    {
        // Kiểm tra quyền
        await this.checkPostPermission(id, userId, role);
        
        return this.prisma.post.delete({ where: { id },});
    }
}
