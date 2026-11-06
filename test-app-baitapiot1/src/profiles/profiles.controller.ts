import {Body, Controller, Delete, Get, Param, ParseIntPipe, 
    Patch, Post, ForbiddenException, Req
} from '@nestjs/common'

import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';


@Controller('profiles')
export class ProfilesController {
    
    constructor(private readonly profilesService: ProfilesService) {}

    // POST ./profiles
    @Post()
    create(
        @Req() req: AuthenticatedRequest,
        @Body() dto: CreateProfileDto
    )
    {
        return this.profilesService.create(req.user.userId, dto);
    }

    // 2. LẤY PROFILE CỦA MÌNH
    // GET /profiles/me
    @Get('me')
    findMine(@Req() req: AuthenticatedRequest) 
    {
        return this.profilesService.findByUserId(req.user.userId);
    }

    // 3. LẤY PROFILE THEO USER ID
    // GET /profiles/1
    @Get(':userId')
    findByUserId(@Param('userId', ParseIntPipe) userId: number) 
    {
        return this.profilesService.findByUserId(userId);
    }

    // 4. CẬP NHẬT PROFILE CỦA MÌNH
    // PATCH /profiles/me
    @Patch('me')
    updateMine(
        @Req() req: AuthenticatedRequest,
        @Body() dto: UpdateProfileDto
    ) 
    {
        return this.profilesService.update(req.user.userId, dto);
    }

    // 5. CẬP NHẬT PROFILE THEO USER ID
    // PATCH /profiles/1
    @Patch(':userId')
    update(
        @Param('userId', ParseIntPipe) userId: number,
        @Req() req: AuthenticatedRequest,
        @Body() dto: UpdateProfileDto
    ) 
    {

        // Chỉ cho phép sửa Profile của chính mình
        if (userId !== req.user.userId)   throw new ForbiddenException('Bạn không có quyền sửa Profile này');


        return this.profilesService.update(req.user.userId, dto);
    }


    // 6. XÓA PROFILE CỦA MÌNH
    // DELETE /profiles/me
    @Delete('me')
    removeMine(@Req() req: AuthenticatedRequest) 
    {
        return this.profilesService.remove(req.user.userId);
    }

    // 7. XÓA PROFILE THEO USER ID
    // DELETE /profiles/1
    @Delete(':userId')
    remove(
        @Param('userId', ParseIntPipe) userId: number,
        @Req() req: AuthenticatedRequest
    ) 
    {

        if (userId !== req.user.userId) {         throw new ForbiddenException('Bạn không có quyền xóa Profile này');}

        return this.profilesService.remove(req.user.userId);
    }

    
}
