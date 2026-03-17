import { Injectable, Logger, BadRequestException } from '@nestjs/common';
// import axios from '@nestjs/axios';

export interface WeChatUserInfo {
  openid: string;
  nickname: string;
  sex: number;
  language: string;
  city: string;
  province: string;
  country: string;
  headimgurl: string;
  privilege: string[];
  unionid?: string;
}

export interface WeChatTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  openid: string;
  scope: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class WeChatService {
  private readonly logger = new Logger(WeChatService.name);

  // 这些配置应该从环境变量获取
  private readonly appId = process.env.WECHAT_APP_ID || 'your_app_id';
  private readonly appSecret = process.env.WECHAT_APP_SECRET || 'your_app_secret';

  /**
   * 通过 code 获取 access_token 和 openid
   * @param code 微信回调的 code
   */
  async getAccessToken(code: string): Promise<WeChatTokenResponse> {
    // const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appId}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`;

    try {
      // 在真实环境中使用
      // const response = await axios.get<WeChatTokenResponse>(url);
      // const data = response.data;

      // if (data.errcode) {
      //   this.logger.error(`WeChat login error: ${data.errmsg}`);
      //   throw new BadRequestException(`WeChat error: ${data.errmsg}`);
      // }

      // return data;

      // Mock response for development without real credentials
      this.logger.log(`[Mock WeChat] Exchanging code ${code} for token`);
      return {
        access_token: 'mock_access_token_' + code,
        expires_in: 7200,
        refresh_token: 'mock_refresh_token_' + code,
        openid: 'mock_openid_' + code,
        scope: 'snsapi_login',
        unionid: 'mock_unionid_' + code,
      };
    } catch (error) {
      this.logger.error('Failed to get WeChat access token', error);
      throw new BadRequestException('Failed to login with WeChat');
    }
  }

  /**
   * 获取微信用户信息
   * @param accessToken
   * @param openid
   */
  async getUserInfo(accessToken: string, openid: string): Promise<WeChatUserInfo> {
    // const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}`;

    try {
      // const response = await axios.get<WeChatUserInfo>(url);
      // return response.data;

      // Mock response
      return {
        openid,
        nickname: `WeChatUser_${openid.slice(0, 6)}`,
        sex: 1,
        language: 'zh_CN',
        city: 'Beijing',
        province: 'Beijing',
        country: 'CN',
        headimgurl:
          'https://thirdwx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChqkkojH65fZhJq8809jC8nZcNoVw6e6jib2e8gn9x2j32/132',
        privilege: [],
        unionid: 'mock_unionid_' + openid,
      };
    } catch (error) {
      this.logger.error('Failed to get WeChat user info', error);
      throw new BadRequestException('Failed to get WeChat user info');
    }
  }
}
