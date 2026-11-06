import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto 
{
  @ApiProperty({
    description: 'Tiêu đề bài viết',
    example: 'Học NestJS tuần 5'
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Nội dung bài viết',
    example: 'Học Nội dung bài viết '
  })
  @IsString()
  @IsNotEmpty()
  content!: string;
}