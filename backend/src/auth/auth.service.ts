import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.login(user);
  }

  async validateSocialLogin(provider: 'facebook' | 'google', profile: any): Promise<User> {
    const { id, emails, displayName } = profile;
    const email = emails[0].value;

    let user = await this.usersService.findBySocialId(provider, id);

    if (!user) {
      // Check if user exists with this email
      user = await this.usersService.findByEmail(email);

      if (user) {
        // Update existing user with social ID
        if (provider === 'facebook') {
          user = await this.usersService.update(user.id, { facebookId: id });
        } else {
          user = await this.usersService.update(user.id, { googleId: id });
        }
      } else {
        // Create new user
        const createUserDto: CreateUserDto = {
          email,
          name: displayName,
          password: Math.random().toString(36).slice(-8), // Generate random password
        };

        if (provider === 'facebook') {
          createUserDto.facebookId = id;
        } else {
          createUserDto.googleId = id;
        }

        user = await this.usersService.create(createUserDto);
      }
    }

    return user;
  }
}