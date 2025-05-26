import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.FACEBOOK_APP_ID || 'your-facebook-app-id',
      clientSecret: process.env.FACEBOOK_APP_SECRET || 'your-facebook-app-secret',
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/auth/facebook/callback',
      scope: 'email',
      profileFields: ['emails', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const user = await this.authService.validateSocialLogin('facebook', profile);
    done(null, user);
  }
}