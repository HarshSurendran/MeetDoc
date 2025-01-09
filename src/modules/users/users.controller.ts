import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './interface/usersdto';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }
    
    @Get("/:id")
    async getUser(@Param('id') id: string) {
        console.log("reached get users endpoint", id)
        return await this.userService.getUserById(id);
    }

    @Patch("/:id")
    async updateUser(@Param('id') param: { id: string }, @Body() body: Partial<CreateUserDto>) {
        console.log("reached updateUser end point", body)
        return await this.userService.updateUser(param.id, body);
    }

    
    
}
