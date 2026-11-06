import { Module } from '@nestjs/common';
import {Injectable, ConflictException, NotFoundException} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';


@Injectable()
export class ProfilesService {
    constructor(private readonly prisma: PrismaService) {}

    // 1. TẠO PROFILE
    async create(userId: number, dto: CreateProfileDto)
    {
        // kiểm tra tồn tại của user
        const user = await this.prisma.user.findUnique({where: {id: userId}});

        if(!user) throw new NotFoundException('User ko tồn tại');

        // lại kiểm tra nó có Profile chưa
        const existingProfile = await this.prisma.profile.findUnique({where: {userId: userId}});
        if(existingProfile) throw new ConflictException('User đã có Profile rồi, không được tạo mới nữa');

        // oke hết thì tạo Profile lên database
        return this.prisma.profile.create({
            data: {userId, bio: dto.bio, avatar: dto.avatar}
        });
    }

    // 2. LẤY PROFILE THEO USER ID
    async findByUserId(userId: number)
    {
        // lấy profile và id, name, email của userId luôn
        const profile = await this.prisma.profile.findUnique({
            where: {userId},
            include: {
                user: {
                    select: {id: true, name: true, email: true}
                }
            }
        })

        if(!profile) throw new NotFoundException('Profile ko tồn tại');

        return profile;
        
    }

    // 3. Cập nhật profile
    async update(userId: number, dto: UpdateProfileDto)
    {
        // gọi hàm ở trên để lấy ra Profile
        await this.findByUserId(userId);
        return this.prisma.profile.update({where: {userId}, data: {bio: dto.bio, avatar: dto.avatar}})

    }

    // 4. XÓA PROFILE
    async remove(userId: number) 
    {
        await this.findByUserId(userId);

        return this.prisma.profile.delete({where: { userId },});
    }
}
