import Router from '@koa/router';
import { userController } from './controller';
import { authMiddleware } from '../../middleware/auth';
import type { AppState, AppContext } from '../../shared/types';

const router = new Router<AppState, AppContext>({
  prefix: '/api/v1/users',
});

router.get('/', userController.list);
router.get('/:id', userController.getById);
router.get('/username/:username', userController.getByUsername);

router.post('/:id/follow', authMiddleware(), userController.follow);
router.delete('/:id/follow', authMiddleware(), userController.unfollow);

export default router;
