/**
 * @description: 公共装饰器
 * 文件定义了一个名为 Public 的装饰器，用于在 NestJS 应用中标记某些路由为公共访问路由。
 * 这个装饰器的主要作用是：
    1. 通过 SetMetadata 函数为路由控制器或方法设置元数据
    2. 使用 IS_PUBLIC_KEY 作为元数据的键，值为 true
    3. 标记被装饰的路由不需要进行身份验证即可访问
 * @return {*}
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
