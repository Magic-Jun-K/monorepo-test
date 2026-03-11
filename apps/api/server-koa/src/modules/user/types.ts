import { z } from '../../core/validator';

export const userListQuerySchema = z.object({
  page: z.coerce.number().min(1).optional(),
  pageSize: z.coerce.number().min(1).max(100).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['username', 'email', 'createdAt']).optional(),
  sortOrder: z.enum(['ASC', 'DESC']).optional(),
});

export type UserListQuery = z.infer<typeof userListQuerySchema>;

export interface UserListItem {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
