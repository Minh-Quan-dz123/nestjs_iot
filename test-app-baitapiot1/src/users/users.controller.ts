import { Controller } from '@nestjs/common';
import {Body, Delete, Get, Param, ParseIntPipe, Post, Put} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // xóa ko dùng nx
    // @Post()
    // create(@Body() dto: CreateUserDto)
    // {
    //     return this.usersService.create(dto);
    // }

    @Get()
    findAll()
    {
        return this.usersService.findAll();
    }

    @Get(':id')
    findUserById(@Param('id', ParseIntPipe) id: number)
    {
        return this.usersService.findUserById(id);
    }

    @Get('by-email/:email')
    findUserByEmail(@Param('email') email: string)
    {
        return this.usersService.findUserByEmail(email);
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateUserDto)
    {
        return this.usersService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number)
    {
        return this.usersService.remove(id);
    }

}
