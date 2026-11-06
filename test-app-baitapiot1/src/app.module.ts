import * as Joi from 'joi';
import { type MiddlewareConsumer, type NestModule, Module, RequestMethod } from '@nestjs/common';
import { HelloController } from './hello.controller.js';
import { HelloService } from './hello.service.js';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config'; // để đọc biến môi trường
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { ProfilesModule } from './profiles/profiles.module';
import { PostsModule } from './posts/posts.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthMiddleware } from './common/middleware/jwt-auth.middleware';
import { UsersController } from './users/users.controller.js';
import { ProfilesController } from './profiles/profiles.controller.js';
import { PostsController } from './posts/posts.controller.js';
import { MqttModule } from './mqtt/mqtt.module';

@Module({
  imports: [
    UsersModule, 
    ProfilesModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: 
        Joi.object({
          DATABASE_URL: Joi.string().required(),
          JWT_SECRET: Joi.string().min(32).required(),
          PORT: Joi.number().port().default(3000),

          MQTT_URL: Joi.string().uri({scheme: ['mqtts']}).required(),
          MQTT_USERNAME: Joi.string().required(),
          MQTT_PASSWORD: Joi.string().required(),
          MQTT_CLIENT_ID: Joi.string().required(),
        }),
      validationOptions: {
        libraryOptions: {   // phiên bản joi này cần có thêm cái này
          allowUnknown: true, // Cho phép các biến môi trường khác
          abortEarly: false,  // Hiển thị nhiều lỗi validation cùng lúc
        }
      }
    }),
    PostsModule,
    AuthModule,
    MqttModule

  ],
  controllers: [HelloController],
  providers: [HelloService],
})
// isGlobal: true cho phép ConfigService được sử dụng trong các 
// module khác mà không phải import ConfigModule lại ở từng module.

// cần implements NestModule nếu muốn cấu hình Middleware theo cơ chế 
// module của NestJS. Khi NestJS khởi tạo module, nó sẽ gọi phương thức 
// configure() để lấy cấu hình Middleware. 
export class AppModule implements NestModule 
{
  configure(consumer: MiddlewareConsumer)
  {
    // 1. LOGGER MIDDLEWARE
    // Áp dụng cho tất cả HTTP Request.
    // Chọn class LoggerMiddleware để đăng ký vào hệ thống xử lý HTTP request.
    consumer.apply(LoggerMiddleware).forRoutes({path: '{*splat}', method: RequestMethod.ALL});

    //Một chi tiết quan trọng:
    // consumer.apply(LoggerMiddleware)
    // Khác với:
    // consumer.apply(new LoggerMiddleware())
    // là truyền class LoggerMiddleware, không tự tạo đối tượng bằng new.
    // => NestJS sẽ quản lý việc khởi tạo và sử dụng Middleware thông qua hệ thống Dependency Injection của nó.

    // (1) forRoutes() là phương thức có sẵn trong API cấu hình Middleware của NestJS. 
    //     Nó nhận thông tin về các route cần áp dụng Middleware.

    // path: '{*x}' : path xác định đường dẫn HTTP mà Middleware sẽ áp dụng.ví dụ path: 'users'
    // path: '{*x}' là cú pháp wildcard trong hệ thống định tuyến mà NestJS hỗ trợ.
      // *: Khớp với nhiều đoạn đường dẫn bất kỳ.
      // x: Tên tham số wildcard, có thể đặt tên khác.
      // {}: Cho phép phần wildcard là tùy chọn, giúp khớp cả đường dẫn gốc /.
      // => mục đích của {*splat} là khớp tất cả đường dẫn, bao gồm cả /.

    // 2. JWT AUTHENTICATION MIDDLEWARE
    // Áp dụng cho tất cả API của:
    // - UsersController
    // - ProfilesController
    // - PostsController
    //
    // Middleware sẽ:
    // 1. Lấy JWT từ Authorization Header.
    // 2. Kiểm tra JWT bằng JwtService.
    // 3. JWT hợp lệ -> gọi next().
    // 4. JWT không hợp lệ -> trả HTTP 401.

    consumer.apply(JwtAuthMiddleware).forRoutes(UsersController, ProfilesController)

  }
}


