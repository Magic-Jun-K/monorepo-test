import Router from '@koa/router';
import AuthController from '../controllers/authController.js';

const router = new Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);

export default router;
