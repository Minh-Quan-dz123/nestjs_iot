import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';


// CanActivate	        Interface quy định Guard phải có hàm canActivate()
// ExecutionContext	    Cung cấp thông tin về request và API đang được gọi
// Reflector	        Đọc metadata mà Decorator đã gắn

import type {
    AuthenticatedRequest,
    UserRole
} from '../../common/interfaces/authenticated-request.interface';

@Injectable()
export class RolesGuard implements CanActivate{
    constructor(private readonly reflector: Reflector){}

    canActivate(context: ExecutionContext): boolean
    {
        // 1 lấy danh sách role được phép truy cập API
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY, [context.getHandler(), context.getClass()]
        );

        // 2. ko yêu cầu role cụ thể
        if(!requiredRoles?.length) return true;

        // 3. lấy thông tin user từ request
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

        const user = request.user;

        // 4. kiểm tra role
        if(!user || !requiredRoles.includes(user.role)) throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này');

        // 5. cho phép tiếp tục xử lý request
        return true;
    }
}

// Phương thức này có nhiệm vụ quyết định request có được đi tiếp hay không.