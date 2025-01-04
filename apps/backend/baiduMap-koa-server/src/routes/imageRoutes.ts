import Router from '@koa/router';
import ImageController from '../controllers/imageController.js';

const router = new Router();

router.post('/upload', ImageController.upload);
router.get('/:id', ImageController.getImage);

export default router;
