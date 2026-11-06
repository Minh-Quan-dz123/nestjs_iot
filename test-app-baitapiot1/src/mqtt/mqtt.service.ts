import {Injectable, Logger, Inject, ServiceUnavailableException} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import type { LedCommandDto } from './dto/led-cpmmand.dto';

@Injectable()
export class MqttService 
{
    private readonly logger = new Logger(MqttService.name);

    // Do đăng ký MQTT Client bằng Injection Token dạng chuỗi: name: 'MQTT_PUBLISHER'
    // nên dùng : @Inject('MQTT_PUBLISHER')
    constructor(@Inject('MQTT_PUBLISHER') private readonly mqttPubliser: ClientProxy) {}

    // 1. tự định nghĩa hàm xử lý dữ liệu được thu thập
    handleTelemetry(payload: unknown, topic: string): void {

        // kiểm tra dữ liệu đầu vào
        // phải là dạng object, độ ẩm, nhiệt độ phải ở tỏng payload
        // và độ ẩm, nhiệt độ là number
        if(typeof payload !== 'object' || payload === null 
            || !('temperature' in payload )
            || !('humidity' in payload )
            || typeof payload.humidity !== 'number'
            || typeof payload.temperature !== 'number'
        )
        {
            this.logger.warn('dữ liệu cảm biến ko hợp lệ');
            return;
        }

        // nếu dữ liệu ok thì in ra là hợp lệ
        this.logger.log(`Topic: ${topic}`);
        this.logger.log(`Nhiệt độ: ${payload.temperature} °C`);
        this.logger.log(`Độ ẩm: ${payload.humidity} %`);
        this.logger.log(`Payload: ${JSON.stringify(payload)}`);
    }

    // 2. hàm published
    async publishLed(dto: LedCommandDto)
    {
        // 1. xác định topic điều khiển 
        const topic = `iot/week6/garden${dto.gardenId}/led/set`;

        // 2. chuẩn bị payload
        const payload = {
            gardenId: dto.gardenId,
            led: dto.led,
            state: dto.state,
        }

        // 3. Publish MQTT message
        try {
            // Observable là kiểu dữ liệu thuộc thư viện RxJS, dùng để biểu diễn các giá trị hoặc sự kiện được phát ra theo thời gian.
            // pipe() dùng để áp dụng các toán tử RxJS cho Observable.
            // timeout({ first: 5000 }) quy định nếu không có kết quả đầu tiên trong vòng 5 giây, Observable sẽ phát sinh lỗi timeout.
            // firstValueFrom(). Hàm này chuyển Observable thành Promise, lấy giá trị đầu tiên được phát ra.
            await firstValueFrom(this.mqttPubliser.emit(topic, payload).pipe(timeout({first: 5000})));
        }
        catch (error)
        {
            this.logger.error('Gửi lệnh MQTT thất bại hoặc quá thời gian chờ',
                error instanceof Error ? error.stack : String(error));

            throw new ServiceUnavailableException('ko xác nhận đc việc gửi lệnh MQTT');

            
        }

        // 4. Trả kết quả cho HTTP Client
        this.logger.log(`Đã publish tới topic: ${topic}`);

        return {
        status: 'publish_completed',
        topic,
        payload,
        };
    }

}