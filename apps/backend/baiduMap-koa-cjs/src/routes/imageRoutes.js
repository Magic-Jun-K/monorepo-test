/**
 * 图片相关路由
 * 定义所有与图片相关的API端点
 */
const Router = require('@koa/router');

const imageController = require('../controllers/imageController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateImage } = require('../utils/validation');
const rateLimit = require('../middleware/rateLimit'); // Ensure this imports the limiter correctly

const router = new Router({
  prefix: '/api/images'
});

// 上传图片
// POST /api/images
router.post('/',
  authenticate, // 验证用户身份
  upload, 
  validateImage, // 验证上传参数
  rateLimit, // 限制上传频率
  imageController.upload
);

// 获取图片列表
// GET /api/images?page=1&limit=10&tag=nature
router.get('/',
  rateLimit,
  imageController.getImages
);

// 获取单个图片
// GET /api/images/:id
router.get('/:id',
  rateLimit,
  imageController.getImage
);

// 删除图片
// DELETE /api/images/:id
router.delete('/:id',
  authenticate,
  rateLimit,
  imageController.deleteImage
);

module.exports = router;
