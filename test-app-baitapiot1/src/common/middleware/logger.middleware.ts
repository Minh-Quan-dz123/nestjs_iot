import { Injectable, Logger, type NestMiddleware } from "@nestjs/common";
import type {Request, Response, NextFunction} from 'express';
// NextFunction	    Kiểu của hàm chuyển quyền xử lý sang bước tiếp theo
// Logger	        Class dùng để ghi log ra terminal       

// tạo một Middleware ghi log HTTP trong NestJS. Ví dụ terminal hiển thị:
// [Nest] 12345 LOG [HTTP] GET /users - 200 - 15ms
// [Nest] 12345 LOG [HTTP] POST /users - 201 - 32ms
// [Nest] 12345 LOG [HTTP] DELETE /users/5 - 404 - 8ms

@Injectable()
export class LoggerMiddleware implements NestMiddleware      // Nghĩa là class phải tuân thủ interface NestMiddleware.
{
    // Interface này yêu cầu có phương thức: use(req, res, next)
    private readonly logger = new Logger('HTTP');
    
    // req là biến chứa đối tượng request thực tế.
    use(req: Request, res: Response, next: NextFunction)
    {
        const start = Date.now();

        // ghi log khi response hoàn thành
        res.on('finish', () => {
            const duration = Date.now() - start;
            this.logger.log(`${req.method} ${req.originalUrl}` + `- ${res.statusCode} - ${duration}ms`,);
        });

        // chuyển request tới middleware/handler tiếp theo
        next();
    }
}