import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/interface/usersdto';
import { AdminService } from './admin.service';
import { addAbortSignal } from 'stream';
import { ObjectId } from 'mongoose';

@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService,
        private userService: UsersService
    ) {}

    @Post('users')
    async createUser(@Body() body: CreateUserDto): Promise<{ status: Boolean}> {
        return await this.adminService.createUser(body);
    }

    @Get('users')
    async getUser() {
        return await this.adminService.getUsers();
    }

    @Delete('users/:id')
    async deleteUser(@Param('id') id: string) {
        return await this.userService.deleteUser(id);
    }

    @Patch('users/:id')
    async updateUser(@Param('id') id: string, @Body() body: CreateUserDto) {
        console.log("reached updateUser end point", body)
        return await this.userService.updateUser(id, body);      
    }

    @Patch('users/toggleblock/:id')
    async toggleBlock(@Param('id') id: string) {
        return await this.adminService.toggleBlock(id);
    }


}
