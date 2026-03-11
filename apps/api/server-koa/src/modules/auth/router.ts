import Router from '@koa/router';

import { authController } from './controller';
import { authMiddleware } from '../../middleware/auth';
import type { AppState, AppContext } from '../../shared/types';

const router = new Router<AppState, AppContext>({
  prefix: '/api/v1/auth',
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

router.get('/profile', authMiddleware(), authController.getProfile);
router.put('/profile', authMiddleware(), authController.updateProfile);
router.post('/logout', authMiddleware(), authController.logout);
router.post('/change-password', authMiddleware(), authController.changePassword);

export default router;
