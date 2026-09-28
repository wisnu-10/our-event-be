import type { Request, Response } from 'express';
import { userService } from './user.service';
import { sendSuccess } from '../../helpers/response.helper';
import { getAuthPayload } from '../../middlewares/auth.middleware';
import type { UpdateUserInput } from './validators/update-user.validator';

export const userController = {
  async me(_req: Request, res: Response) {
    const { id } = getAuthPayload(res);
    const user = await userService.getProfile(id);

    return sendSuccess(res, 'Profil berhasil dimuat', { user });
  },

  async updateMe(req: Request, res: Response) {
    const { id } = getAuthPayload(res);
    const user = await userService.updateProfile(id, req.body as UpdateUserInput);

    return sendSuccess(res, 'Profil berhasil diperbarui', { user });
  },
};
