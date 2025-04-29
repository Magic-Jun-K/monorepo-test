import { Context } from 'koa';
import fs from 'node:fs';
import { getPool } from '../services/database.ts';
import ImageService from '../services/imageService.ts';
import ErrorHandler from '../utils/error.ts';
import Validation from '../utils/validation.ts';
import logger from '../utils/logger.ts';
import { cache } from '../utils/cache.ts';

class ImageController {
  private pool = getPool();

  async upload(ctx: Context) {
    try {
      const { file } = (ctx.request as any).files as { file: any };
      const { tags } = ctx.request.body as { tags?: string };

      const validationError = Validation.validateImageData(file);
      if (validationError) {
        throw ErrorHandler.handleError(ctx, validationError);
      }

      const processedImage = await ImageService.uploadImage(file);

      const query = `
        INSERT INTO images 
        (filename, original_name, path, mimetype, size, uploaded_by, tags, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`;
      const values = [
        processedImage.filename,
        file.originalname,
        processedImage.path,
        file.mimetype,
        file.size,
        ctx.state.user._id,
        tags ? tags.split(',') : [],
        processedImage.metadata
      ];

      const { rows } = await this.pool.query(query, values);
      const image = rows[0];

      await cache.del('recent_images');

      logger.info(`Image uploaded successfully: ${image.filename}`);
      ctx.status = 201;
      ctx.body = { success: true, data: image };
    } catch (error) {
      logger.error('Image upload failed:', error);
      ErrorHandler.handleError(ctx, error);
    }
  }

  async getImages(ctx: Context) {
    try {
      const page = ctx.query.page ? parseInt(ctx.query.page as string) : 1;
      const limit = ctx.query.limit ? parseInt(ctx.query.limit as string) : 10;
      const tag = ctx.query.tag as string | undefined;

      const cacheKey = `images_${page}_${limit}_${tag || 'all'}`;
      const cachedData = await cache.get(cacheKey);

      if (cachedData) {
        ctx.body = JSON.parse(cachedData);
        return;
      }

      const countQuery = tag ? 
        'SELECT COUNT(*) FROM images WHERE $1 = ANY(tags)' : 
        'SELECT COUNT(*) FROM images';
      const { rows: countRows } = await this.pool.query(countQuery, tag ? [tag] : []);
      const total = parseInt(countRows[0].count);

      const selectQuery = `
        SELECT i.*, u.username, u.email 
        FROM images i
        LEFT JOIN users u ON i.uploaded_by = u.id
        ${tag ? 'WHERE $1 = ANY(i.tags)' : ''}
        ORDER BY i.created_at DESC
        LIMIT $${tag ? 2 : 1} OFFSET $${tag ? 3 : 2}`;
      const selectValues = tag ? [tag, limit, (page - 1) * limit] : [limit, (page - 1) * limit];
      const { rows: images } = await this.pool.query(selectQuery, selectValues);

      const response = {
        success: true,
        data: images,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };

      await cache.set(cacheKey, JSON.stringify(response), 300);
      ctx.body = response;
    } catch (error) {
      logger.error('Failed to get images:', error);
      ErrorHandler.handleError(ctx, error);
    }
  }

  async getImage(ctx: Context) {
    try {
      const { id } = ctx.params;
      const { rows } = await this.pool.query(
        `SELECT i.*, u.username, u.email 
         FROM images i
         LEFT JOIN users u ON i.uploaded_by = u.id
         WHERE i.id = $1`,
        [id]
      );
      const image = rows[0];

      if (!image) {
        ErrorHandler.handleError(ctx, { status: 404, message: 'Image not found' });
        return;
      }

      ctx.body = { success: true, data: image };
    } catch (error) {
      logger.error(`Failed to get image ${ctx.params.id}:`, error);
      ErrorHandler.handleError(ctx, error);
    }
  }

  async deleteImage(ctx: Context) {
    try {
      const { id } = ctx.params;
      const { rows } = await this.pool.query(
        'SELECT * FROM images WHERE id = $1',
        [id]
      );
      const image = rows[0];

      if (!image) {
        ErrorHandler.handleError(ctx, { status: 404, message: 'Image not found' });
        return;
      }

      if (image.uploaded_by.toString() !== ctx.state.user._id.toString()) {
        ErrorHandler.handleError(ctx, { status: 403, message: 'No permission to delete this image' });
        return;
      }

      await Promise.all([
        fs.promises.unlink(image.path),
        this.pool.query('DELETE FROM images WHERE id = $1', [id])
      ]);

      await cache.del('recent_images');
      await cache.del(`image_${id}`);
      ctx.status = 204;
    } catch (error) {
      logger.error(`Failed to delete image ${ctx.params.id}:`, error);
      ErrorHandler.handleError(ctx, error);
    }
  }
}

export default new ImageController();
