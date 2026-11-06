
import {IsOptional, IsString, IsNotEmpty} from 'class-validator';
import {ApiPropertyOptional} from '@nestjs/swagger'

export class UpdatePostDto {
  @ApiPropertyOptional({
    description: 'tiêu đề mới',
    example: 'tiêu đề đã cập nhật'
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiPropertyOptional({
    description: 'nội dung mới',
    example: 'nội dung đã cập nhật'
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;
}
