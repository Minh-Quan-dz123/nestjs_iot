// có nhiệm vụ kết nối nestjs qua postgresql thông qua prisma
// 1 kế thừa PrismaClient để sử dụng các hàm truy vấn
// 2 đọc thông tin kết nối PostgreSQL từ biến môi trường Database_url
// 3 quản lý vòng đời kết nối từ khi nestjs khởi tạo module và ngắt kết nối khi module được hủy


import { Injectable, type OnModuleInit, type OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// Injectable	Đánh dấu class có thể được NestJS quản lý và tiêm vào class khác
// OnModuleInit	Interface quy định phương thức onModuleInit()
// OnModuleDestroy	Interface quy định phương thức onModuleDestroy()
// ConfigService	Đọc cấu hình như DATABASE_URL
// PrismaPg	Adapter giúp Prisma Client sử dụng driver PostgreSQL
// PrismaClient	Class được Prisma sinh ra, cung cấp các phương thức truy vấn database

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy, OnModuleInit
{
    constructor(configService: ConfigService)
    {
        // ConfigService giúp đọc các biến cấu hình của ứng dụng, chẳng hạn: File .env:
        const connectionString = configService.getOrThrow<string>('DATABASE_URL');
        const adapter = new PrismaPg({connectionString});
        super({adapter});
    }

    // khi module init thì kết nối, khi destroy thì dis connect
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
}