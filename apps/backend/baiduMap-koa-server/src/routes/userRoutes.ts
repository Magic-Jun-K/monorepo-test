import Router from '@koa/router';
import UserController from '../controllers/userController.js';

const router = new Router();

router.get('/:id', UserController.getUser);

export default router;
