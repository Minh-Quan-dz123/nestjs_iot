
import {Body, Controller, Delete, Get,
  Param, ParseIntPipe, Patch, Post, Req, UseGuards
} from '@nestjs/common';

import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator'

// swagger
import {ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse} from '@nestjs/swagger';

@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('user',  'admin')
@ApiTags('Posts') // giúp nhóm các endpoint Posts vào một mục trong Swagger.
@ApiBearerAuth()  // cho Swagger biết các API này sử dụng JWT Beare
export class PostsController {
  constructor(private readonly postsService: PostsService,) {}

  // 1. POST /posts
  @ApiOperation({
    summary: 'Tạo bài viết mới',
    description: 'User hoặc Admin có thể tạo bài viết.',
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo bài viết thành công',
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc JWT không hợp lệ',
  })
  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePostDto) 
  {
    return this.postsService.create(req.user.userId, dto);
  }

  // GET /posts
  @ApiOperation({
    summary: 'Lấy thông tin một bài viết theo ID',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID của bài viết',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy bài viết thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Bài viết không tồn tại',
  })
  @Get()
  findAll() 
  {
    return this.postsService.findAll();
  }

  // GET /posts/user/1
  @Get('user/:userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) 
  {
    return this.postsService.findByUserId(userId);
  }

  // GET /posts/1
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest, @Body() dto: UpdatePostDto)
  {
    return this.postsService.findOne(id);
  }

  // PATCH /posts/1
  @Roles('admin')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdatePostDto
  ) 
  {
    return this.postsService.update(id, req.user.userId, req.user.role, dto);
  }

  // DELETE /posts/1
  @Delete(':id') // cả user cũng được xóa, giống fb ấy
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest
  )
  {
    return this.postsService.remove(id, req.user.userId, req.user.role);
  }
}
