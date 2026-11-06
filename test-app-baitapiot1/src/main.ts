import { NestFactory } from '@nestjs/core'; // Package chứa những thành phần cốt lõi của NestJS.
import { ValidationPipe } from '@nestjs/common'; // dùng để sử dunjg các quy tắc kiểm tra của class - validator trên DTO

import { AppModule } from './app.module';   // Dòng này import class AppModule từ file app.module.ts.

// thêm swagger
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

// thêm mqtt
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() 
{
  // tạo instance chính của server
  const app = await NestFactory.create(AppModule);

  // 1. đăng ký Pipe ở phạm vi toàn ứng dụng (ko cần khai báo riêng trong mỗi endpoint, nó dùng chung)
  app.useGlobalPipes(new ValidationPipe({whitelist: true,  forbidNonWhitelisted:false, transform: true,}));
  // (1) whitelist: true = nestjs   tự động loại bỏ thuộc tính bị thừa từ request trước khi vào controller
  // (2) forbidNonWhitelisted:true  từ chối request nếu có thuộc tính ko được phép
  // (3) transform: true	          Chuyển đổi dữ liệu đầu vào thành kiểu phù hợp khi có thể
 
  // 2. ----- swagger -----
  // khai báo thông tin tài liệu Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Server NestJS IoT của Quân Đẹp Zai')
    .setDescription('tài liệu api quản lý user, profiles, posts và auth')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  // tạo tài liệu Swagger từ các controller và thông tin tài liệu đã khai báo ở trên
  const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);

  // sau đó đăng ký giao diện swagger tại /api và đọc port từ configService
  SwaggerModule.setup('api', app, documentFactory)
  // -----------------------

  const configService = app.get(ConfigService);
  const port = Number(configService.get<number>('PORT')??3000);

  // 3. thêm mqtt
  const mqttUrl = configService.getOrThrow<string>('MQTT_URL');
  const mqttUsername = configService.getOrThrow<string>('MQTT_USERNAME');
  const mqttPassword= configService.getOrThrow<string>('MQTT_PASSWORD');
  const mqttClientId= configService.getOrThrow<string>('MQTT_CLIENT_ID');

  // Gắn MQTT Microservice vào ứng dụng NestJS
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: mqttUrl,
      username:mqttUsername,
      password: mqttPassword,
      clientId: mqttClientId,

      clean: true,
      reconnectPeriod: 2000, // Thử kết nối lại sau khoảng 2 giây khi mất kết nối
      connectTimeout: 10000, // Timeout cho một lần thử kết nối, tính bằng mili giâ
    }
  })

  // 3. Khởi động MQTT Microservice
  await app.startAllMicroservices();



  // 4. Khởi động HTTP Server
  //await app.listen(process.env.PORT??3000);
  await app.listen(port);


  console.log('MQTT Microservice đã khởi động');
  console.log(`HTTP Server: http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api`);

}
bootstrap();
