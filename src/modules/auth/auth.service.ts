import { Injectable } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { UsersService } from '../users/users.service';
// import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  // constructor(
  //   private usersService: UsersService,
  //   private jwtService: JwtService,
  // ) {}

  // async validateUser(username: string, pass: string): Promise<any> {
  //   const user = await this.usersService.findOneByUsername(username);
  //   if (user && (await bcrypt.compare(pass, user.password))) {
  //     const { password, ...result } = user;
  //     return result;
  //   }
  //   return null;
  // }

  // async login(user: any) {
  //   const payload = { username: user.username, sub: user.userId };
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }

  // async register(username: string, pass: string): Promise<any> {
  //   const hashedPassword = await bcrypt.hash(pass, 10);
  //   const user = await this.usersService.create(username, hashedPassword);
  //   return this.login(user);
  // }
}
