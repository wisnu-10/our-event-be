import type { Request, Response } from 'express';
import { adminUserService } from './admin-user.service';
import { sendSuccess } from '../../helpers/response.helper';
import { getAuthPayload } from '../../middlewares/auth.middleware';
import { validated } from '../../middlewares/request-validation.middleware';
import type {
  CreateAdminUserInput,
  QueryAdminUserInput,
  UpdateAdminUserRoleInput,
} from './validators/admin-user.validator';

export const adminUserController = {
  async list(req: Request, res: Response) {
    const result = await adminUserService.list(
      validated<QueryAdminUserInput>(req, 'query', {} as QueryAdminUserInput),
    );

    return sendSuccess(res, 'Daftar user berhasil dimuat', result);
  },

  async create(req: Request, res: Response) {
    const result = await adminUserService.create(req.body as CreateAdminUserInput);

    return sendSuccess(res, 'Admin berhasil dibuat', result, 201);
  },

  async updateRole(req: Request, res: Response) {
    const { id } = validated<{ id: string }>(req, 'params', { id: '' });
    const { role } = req.body as UpdateAdminUserRoleInput;
    const result = await adminUserService.updateRole(id, role, getAuthPayload(res).id);

    return sendSuccess(res, 'Role berhasil diubah', result);
  },

  async remove(req: Request, res: Response) {
    const { id } = validated<{ id: string }>(req, 'params', { id: '' });
    const result = await adminUserService.remove(id, getAuthPayload(res).id);

    return sendSuccess(res, 'User berhasil dihapus', result);
  },
};
