/**
 * 图片控制器
 * 处理所有与图片相关的业务逻辑
 */
const Image = require('../models/Image');
const { createError } = require('../utils/error');
const { validateImage } = require('../utils/validation');
const { processImage } = require('../services/imageService');
const logger = require('../utils/logger');
const cache = require('../utils/cache');

class ImageController {
  /**
   * 上传图片
   * @param {Object} ctx Koa上下文
   */
  async upload(ctx) {
    try {
      const { file } = ctx.request.files;
      const { tags } = ctx.request.body;

      // 验证文件
      const validationError = validateImage(file);
      if (validationError) {
        throw createError(400, validationError);
      }

      // 处理图片（压缩、添加水印等）
      const processedImage = await processImage(file);

      // 创建图片记录
      const image = new Image({
        filename: processedImage.filename,
        originalName: file.originalname,
        path: processedImage.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadedBy: ctx.state.user._id,
        tags: tags ? tags.split(',') : [],
        metadata: processedImage.metadata,
      });

      await image.save();

      // 清除相关缓存
      await cache.del('recent_images');

      logger.info(`Image uploaded successfully: ${image.filename}`);

      ctx.status = 201;
      ctx.body = {
        success: true,
        data: image,
      };
    } catch (error) {
      logger.error('Image upload failed:', error);
      throw error;
    }
  }

  /**
   * 获取图片列表
   * @param {Object} ctx Koa上下文
   */
  async getImages(ctx) {
    try {
      const { page = 1, limit = 10, tag } = ctx.query;

      // 尝试从缓存获取数据
      const cacheKey = `images_${page}_${limit}_${tag || 'all'}`;
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        ctx.body = JSON.parse(cachedData);
        return;
      }

      // 构建查询条件
      const query = tag ? { tags: tag } : {};

      // 执行分页查询
      const images = await Image.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('uploadedBy', 'username');

      const total = await Image.countDocuments(query);

      const response = {
        success: true,
        data: images,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };

      // 缓存结果
      await cache.set(cacheKey, JSON.stringify(response), 300); // 缓存5分钟

      ctx.body = response;
    } catch (error) {
      logger.error('Failed to get images:', error);
      throw error;
    }
  }

  /**
   * 获取单个图片
   * @param {Object} ctx Koa上下文
   */
  async getImage(ctx) {
    try {
      const { id } = ctx.params;
      const image = await Image.findById(id).populate('uploadedBy', 'username');

      if (!image) {
        throw createError(404, 'Image not found');
      }

      ctx.body = {
        success: true,
        data: image,
      };
    } catch (error) {
      logger.error(`Failed to get image ${ctx.params.id}:`, error);
      throw error;
    }
  }

  /**
   * 删除图片
   * @param {Object} ctx Koa上下文
   */
  async deleteImage(ctx) {
    try {
      const { id } = ctx.params;
      const image = await Image.findById(id);

      if (!image) {
        throw createError(404, 'Image not found');
      }

      // 检查权限
      if (image.uploadedBy.toString() !== ctx.state.user._id.toString()) {
        throw createError(403, 'No permission to delete this image');
      }

      // 删除文件和数据库记录
      await Promise.all([
        fs.promises.unlink(image.path),
        Image.findByIdAndDelete(id),
      ]);

      // 清除相关缓存
      await cache.del('recent_images');
      await cache.del(`image_${id}`);

      ctx.status = 204;
    } catch (error) {
      logger.error(`Failed to delete image ${ctx.params.id}:`, error);
      throw error;
    }
  }
}

module.exports = new ImageController();
