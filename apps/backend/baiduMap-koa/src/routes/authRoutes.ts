import Router from '@koa/router';
import type { AppContext } from '@/types/index.ts';
import AuthController from '@/controllers/authController.ts';

const router = new Router<AppContext>();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

export default router;
