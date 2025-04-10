import { FastifyInstance } from 'fastify';
import { registerUserController } from '../../controllers/authController/register/registerUserController';
import { loginUserController } from '../../controllers/authController/login/loginUserController';
import { DeleteUserController } from '../../controllers/authController/delete/deleteUserController';
import { GetUserByIdController } from '../../controllers/authController/getById/getuserByIdController';
import { GetAllUsersController } from '../../controllers/authController/getAll/getAllUsersController';
import { verifyAdmin } from '../../middleware/verifyAdmin';
import { LogoutUserController } from '../../controllers/authController/logout/logoutUserController';
import { ForgotPasswordController } from '../../controllers/authController/forgotPassword/forgotPasswordController';
import { ResetPasswordController } from '../../controllers/authController/resetPassword/resetPasswordController';
import { authMiddleware } from '../../middleware/authMiddleware';

export async function userRoutes(fastify: FastifyInstance) {
  // Rotas de autenticação
  fastify.post('/auth/register', registerUserController.createUser);
  fastify.post('/auth/login', loginUserController.loginUser);
  fastify.post(
    '/auth/forgot-password',
    ForgotPasswordController.forgotPassword,
  );
  fastify.patch('/auth/reset-password', ResetPasswordController.resetPassword);

  fastify.post(
    '/auth/logout',
    { preHandler: [authMiddleware] },
    LogoutUserController.create,
  );

  // Rotas de usuário
  fastify.get(
    '/users/:id',
    { preHandler: authMiddleware },
    GetUserByIdController.getUserById,
  );

  fastify.get(
    '/users',
    { preHandler: [authMiddleware, verifyAdmin] },
    GetAllUsersController.getUsers,
  );
  fastify.delete(
    '/users',
    { preHandler: [authMiddleware, verifyAdmin] },
    DeleteUserController.deleteUser,
  );
}
