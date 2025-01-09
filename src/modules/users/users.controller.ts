import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './interface/usersdto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) { }
    
    @Get("/:id")
    async getUser(@Param('id') id: string) {
        console.log("reached get users endpoint", id)
        return await this.userService.getUserById(id);
    }

    @Patch("/:id")
    async updateUser(@Param('id') id: string, @Body() body: Partial<CreateUserDto>) {
        console.log("reached updateUser end point", body)
        return await this.userService.updateUser(id, body);
    }

    @Patch("profilephoto/:id")
    @UseInterceptors(FileInterceptor('photo'))
    async updateProfilePic(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        return await this.userService.updateProfilePhoto(id, file);        
    }
    
}
