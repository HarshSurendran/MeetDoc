import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/interface/usersdto';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateSubscriptionDto } from '../subscription/dto/create-subscription.dto';

@UseGuards(AuthGuard("admin-access-jwt"))
@Controller('admin')
export class AdminController {
    constructor(
        private adminService: AdminService,
        private userService: UsersService,
    ) {}

    @Post('users')
    async createUser(@Body() body: CreateUserDto): Promise<{ status: Boolean}> {
        return await this.adminService.createUser(body);
    }
    
    @Get('users')
    async getUser(@Query('page') page: number, @Query('limit') limit: number) {
        return await this.adminService.getUsers(page, limit);
    }

    @Get('users/:userId')
    async fetchUser(@Param('userId') userId:  string) {
        return await this.userService.getUserById(userId);
    }

    @Delete('users/:userId')
    async deleteUser(@Param('userId') userId: string) {
        return await this.userService.deleteUser(userId);
    }

    @Patch('users/:userId')
    async updateUser(@Param('userId') userId: string, @Body() body: CreateUserDto) {
        console.log("reached updateUser end point", body)
        return await this.userService.updateUser(userId, body);      
    }

    @Patch('users/toggleblock/:userId')
    async toggleBlock(@Param('userId') userId: string) {
        return await this.adminService.toggleBlock(userId);
    }

    @Get('verification-requests')
    async getVerificationRequests(@Query('page') page: number, @Query('limit') limit: number) {
        return await this.adminService.getVerificationRequests(page,limit);
    }

    @Get('verified-doctors')
        async getVerifiedDoctors(@Query('page') page: number, @Query('limit') limit: number) {
            return await this.adminService.getVerifiedDoctors(page, limit);
        }

    @Get('monthly-data')
    async getMonthlyData() {
        return await this.adminService.getMonthlyData();
    }

    @Get('revenue-data')
    async getRevenueData() {
        return await this.adminService.getRevenueData();
    }

    @Get('total-data')
    async totalData() {
        return await this.adminService.totalData();
    }


    @Get('convertdate')
    async convertDate() {
        return await this.adminService.convertDate();
    }

    @Get('subscription')
    async getSubscriptions() {
        return await this.adminService.getSubscriptions();
    }

    @Get('subscription/disabled')
    async getDisabledSubscriptions() {
        return await this.adminService.getDisabledSubscriptions();
    }

    @Post('subscription')
    async createSubscription(@Body() body: CreateSubscriptionDto) {
        return await this.adminService.createSubscription(body);
    }

    @Delete('subscription/:subscriptionId')
    async deleteSubscription(@Param('subscriptionId') subscriptionId: string) {
        return await this.adminService.deleteSubscription(subscriptionId);
    } 
}
