import Router from '@koa/router';
import UserController from '../controllers/userController.ts';

const router = new Router();

router.get('/:id', UserController.getUser);

export default router;
