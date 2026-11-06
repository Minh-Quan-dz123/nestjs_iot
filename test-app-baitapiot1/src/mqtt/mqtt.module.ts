import {Module} from '@nestjs/common'

import { ConfigModule, ConfigService } from '@nestjs/config'

import { MqttEventsController } from './mqtt-events.controller'
import { MqttService } from './mqtt.service'
import { MqttHttpController} from './mqtt-http.controller';
import { RawMqttSerializer } from './serializers/raw-mqtt.serializer';

import {ClientsModule, Transport} from '@nestjs/microservices'

@Module({
    imports: [
        ClientsModule.registerAsync([{ // Đây là phương thức được NestJS cung cấp, giúp đăng ký các 
                                        // MQTT Client và cấu hình chúng thông qua Dependency Injection.
            name: 'MQTT_PUBLISHER', // Tên này tự đặt. NestJS sẽ dùng nó để nhận biết provider nào cần được inject về sau.
            imports: [ConfigModule],
            inject: [ConfigService],

            // Hàm tạo và trả về object cấu hình Client
            useFactory: (config: ConfigService) => ({
                transport: Transport.MQTT,
                options: {
                    url: config.getOrThrow<string>('MQTT_URL'),
                    username: config.getOrThrow<string>('MQTT_USERNAME'),
                    password: config.getOrThrow<string>('MQTT_PASSWORD'),
                    clientId:`${config.getOrThrow<string>('MQTT_CLIENT_ID')}-publisher`,
                    //  Kết nối	MQTT Client ID
                    // MQTT Microservice nhận dữ liệu	    nestjs-week6-server
                    // MQTT ClientProxy gửi lệnh	        nestjs-week6-server-publisher

                    clean: true,
                    reconnectPeriod: 2000,
                    connectTimeout: 10000,

                    serializer: new RawMqttSerializer(),
                }
                
            })
        }])
    ],
    controllers: [MqttEventsController, MqttHttpController],
    providers: [MqttService],
})
export class MqttModule {}