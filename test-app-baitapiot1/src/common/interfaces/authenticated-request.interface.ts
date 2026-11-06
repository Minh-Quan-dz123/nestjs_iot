import type { Request } from 'express';

// Các giá trị role được phép sử dụng
export type UserRole = 'user' | 'admin'; // Đây là Union Type trong TypeScript, nghĩa là UserRole chỉ cho phép một trong hai giá trị 'user' hoặc 'admin'.

export interface AuthenticatedRequest extends Request {
// mở rộng thêm
    user: {
        userId: number;
        email: string;
        role: UserRole;
    };

    // Vì vậy, sau khi JWT được xác minh, ta có thể truy cập:
    // req.user.userId
    // req.user.email
    // req.user.role
}