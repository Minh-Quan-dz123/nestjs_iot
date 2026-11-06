import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
//import type {User} from './user.interface.js'; ko cần nữa
import {CreateUserDto} from './dto/create-user.dto.js';

import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';


@Injectable()
export class UsersService 
{
    constructor(private readonly prisma: PrismaService){}

    // các helper
    // 0.1 kiểm tra email có tồn tại chưa
    async checkExistEmail(email: string)
    {
        const user = await this.prisma.user.findUnique({where: {email}});
        return user !==null;
    }

    // 0.2 xử lý lỗi từ prisma
    // unknown	Kiểu dữ liệu của error chưa xác định
    // never	Kiểu trả về, nghĩa là phương thức không bao giờ kết thúc bình thường để trả kết quả
    private handlePrismaError(error: unknown): never
    {
        // Kiểm tra xem biến error có phải là một đối tượng lỗi thuộc 
        // class PrismaClientKnownRequestError của Prisma hay không.

        // Prisma.PrismaClientKnownRequestError là gì?
        // Đây là một class lỗi được Prisma cung cấp sẵn.
        // Khi Prisma thực hiện truy vấn database và gặp một lỗi đã được 
        // Prisma nhận diện, nó có thể tạo và ném ra đối tượng thuộc class này.
        if(error instanceof Prisma.PrismaClientKnownRequestError)
        {
            if(error.code === 'P2002')
            {
                throw new ConflictException('Email đã tồn tại');
            }

            if(error.code === 'P2025')
            {
                throw new NotFoundException('User không tồn tại');
            }
        }
        throw error;

        // Nhóm P1xxx – Lỗi kết nối và cấu hình database
        // Mã lỗi	Ý nghĩa
        // P1000	Sai tài khoản hoặc mật khẩu database
        // P1001	Không thể kết nối tới database server
        // P1002	Kết nối database bị timeout
        // P1003	Database không tồn tại
        // P1010	Không có quyền truy cập database
        // P1017	Server đã đóng kết nối

        // Nhóm P2xxx – Lỗi truy vấn và thao tác dữ liệu
        // Đây là những mã lỗi mày sẽ thường xuyên gặp khi lập trình CRUD.
        // Mã lỗi	Ý nghĩa	Ví dụ
        // P2000	Dữ liệu vượt quá độ dài cho phép	Chuỗi dài hơn giới hạn cột
        // P2001	Không tìm thấy bản ghi theo điều kiện tìm kiếm	Truy vấn không có bản ghi phù hợp trong một số thao tác
        // P2002	Vi phạm ràng buộc UNIQUE	Email đã tồn tại
        // P2003	Vi phạm ràng buộc khóa ngoại	Thêm bản ghi tham chiếu tới user không tồn tại
        // P2011	Vi phạm ràng buộc NOT NULL	Lưu null vào trường không cho phép
        // P2021	Bảng không tồn tại	Truy vấn bảng chưa được tạo
        // P2022	Cột không tồn tại	Truy vấn cột chưa có trong database
        // P2024	Hết thời gian chờ lấy kết nối từ pool	Connection pool quá tải
        // P2025	Bản ghi cần thiết cho thao tác không tồn tại	update() hoặc delete() với ID không tồn tại
        // P2034	Transaction thất bại vì xung đột ghi hoặc deadlock	Hai transaction tranh chấp dữ liệu
        // P2037	Mở quá nhiều kết nối database	Vượt giới hạn kết nối
    }

    // 1 hàm tạo 1 user và đẩy vào mảng user
    async create(dto: CreateUserDto) 
    {
        if(await this.checkExistEmail(dto.email))  throw new ConflictException('Email đã tồn tại');
        
        try{
            return await this.prisma.user.create({
                data: {name: dto.name, email: dto.email},
            });
        }
        catch (error)
        {
            this.handlePrismaError(error);
        }
    }

    // 2. lấy tất cả user
    async findAll()
    {
        // 'asc' (Ascending): Tăng dần (1 → 2 → 3 → 4).
        // 'desc' (Descending): Giảm dần (4 → 3 → 2 → 1).
        return this.prisma.user.findMany({orderBy: {id: 'asc'}, omit: {password: true}});
    }

    // 3. tìm 1 user theo id
    async findUserById(id: number)
    {
        const user = await this.prisma.user.findUnique({where: {id},  omit: {password: true}});
        if(!user) throw new NotFoundException('user ko tồn tại');
        return user;
    }

    // 4. tìm user theo email (là duy nhất)
    async findUserByEmail(email: string)
    {
        const user = await this.prisma.user.findUnique({where: {email},  omit: {password: true}});
        if(!user) throw new NotFoundException('user ko tồn tại');
        return user;
    }

    // 5. update name, email
    async update(id: number, dto: CreateUserDto)
    {
        const user = await this.findUserById(id);
        if(dto.email !== user.email && (await this.checkExistEmail(dto.email))) throw new ConflictException('Email đã tồn tại');

        try
        {
            return await this.prisma.user.update({where: {id}, 
            data:{
                name: dto.name,
                email: dto.email,
            }})
        }
        catch (error) {
            this.handlePrismaError(error);
        }

    }

    // 6. remove 
    async remove(id: number): Promise<{message: string}>
    {
        // 6.1. Kiểm tra User có tồn tại không
        await this.findUserById(id);
        try
        {
            // $transaction() của Prisma cho phép nhóm nhiều thao tác database vào cùng một giao dịch.
            // 6.2. xóa dữ liệu liên quan và user trong 1 transaction
            await this.prisma.$transaction([
                this.prisma.profile.deleteMany({where: {userId: id}}),
                this.prisma.post.deleteMany({where: {userId:id}}),
                this.prisma.user.delete({where: {id}})
            ])
            return {message: 'xóa user thành công'}
        }
        catch (error)
        {
            this.handlePrismaError(error);
        }
    }
}
