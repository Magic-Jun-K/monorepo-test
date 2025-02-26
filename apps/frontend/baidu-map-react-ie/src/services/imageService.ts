/**
 * 图片服务
 * 处理与后端图片服务相关的所有API请求
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export interface ImageUploadResponse {
  success: boolean;
  data: {
    filename: string;
    path: string;
    url: string;
  };
}

export interface ImageListResponse {
  success: boolean;
  data: Array<{
    _id: string;
    filename: string;
    path: string;
    tags: string[];
    metadata: {
      width: number;
      height: number;
      format: string;
    };
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * 图片服务类
 */
class ImageService {
  /**
   * 上传图片
   * @param file 图片文件
   * @param tags 图片标签
   */
  async uploadImage(file: File, tags?: string[]): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    if (tags) {
      formData.append('tags', tags.join(','));
    }

    const response = await axios.post(`${API_BASE_URL}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * 获取图片列表
   * @param page 页码
   * @param limit 每页数量
   * @param tag 标签筛选
   */
  async getImages(page = 1, limit = 10, tag?: string): Promise<ImageListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(tag && { tag }),
    });

    const response = await axios.get(`${API_BASE_URL}/images?${params}`);
    return response.data;
  }

  /**
   * 获取图片URL
   * @param filename 图片文件名
   */
  getImageUrl(filename: string): string {
    return `${API_BASE_URL}/images/${filename}`;
  }

  /**
   * 删除图片
   * @param id 图片ID
   */
  async deleteImage(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/images/${id}`);
  }
}

export const imageService = new ImageService();
