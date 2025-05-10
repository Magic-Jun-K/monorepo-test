import { /* HttpException, HttpStatus, */ Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(username: string/* , password: string */): Promise<any> {
    const user = await this.authService.validateUser(username);
    console.log("测试auth local validate user", user);
    
    // if (!user) {
    //   throw new HttpException(
    //     { message: 'authorized failed', error: 'please try again later.' },
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }
    if (!user) {
      throw new UnauthorizedException({
        message: '认证失败',
        error: '无效凭证'
      });
    }
    return user;
  }
}
