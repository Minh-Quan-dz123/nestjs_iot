import {IsEmail, IsNotEmpty, IsString} from 'class-validator';

export class CreateUserDto
{
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsEmail()
    email!: string;

    // Dấu ! ở name! và email! là cách báo cho 
    // TypeScript rằng thuộc tính sẽ được gán giá 
    // trị sau, tránh cảnh báo chưa khởi tạo thuộc 
    // tính. Nó không thay thế kiểm tra dữ liệu;
}