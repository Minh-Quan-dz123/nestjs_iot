import { SetMetadata } from "@nestjs/common";
import type { UserRole } from "../../common/interfaces/authenticated-request.interface";

// SetMetadata() là hàm do NestJS cung cấp, dùng để gắn dữ liệu metadata vào class hoặc phương thức.


// key dùng để lưu và đọc thông tin phân quyền
export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

