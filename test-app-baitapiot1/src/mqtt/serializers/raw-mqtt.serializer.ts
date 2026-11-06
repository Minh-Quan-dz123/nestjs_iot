import type {ReadPacket, Serializer} from '@nestjs/microservices';


// ReadPacket: Kiểu thông điệp đầu vào của NestJS.
// string: Kiểu kết quả sau khi serialize.

// class dùng để gọi phương thức đọc đầu vào là 1 loại object nhiều thông tin nhưng
// chỉ lấy ra trường "data" của object đó
export class RawMqttSerializer implements Serializer<ReadPacket, string>
{
    serialize(packet: ReadPacket): string {
        return JSON.stringify(packet.data);
    }

    // Serializer là interface có sẵn của NestJS, quy định khả năng chuyển 
    // dữ liệu sang dạng phù hợp để truyền đi.
}