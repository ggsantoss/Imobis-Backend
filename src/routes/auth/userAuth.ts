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
import { registerSchema } from '../../schemas/swagger/auth/registerSchema';
import { loginSchema } from '../../schemas/swagger/auth/loginSchema';
import { logoutSchema } from '../../schemas/swagger/auth/logoutSchema';
import { getUserByIdSchema } from '../../schemas/swagger/auth/getByIdSchema';
import { ForgotPasswordSchema } from '../../schemas/swagger/auth/forgotPasswordSchema';
import { getAllUsersSchema } from '../../schemas/swagger/auth/getAllSchema';
import { deleteUserSchema } from '../../schemas/swagger/auth/deleteSchema';
import { resetPasswordSchema } from '../../schemas/swagger/auth/resetPasswordSchema';

export async function userRoutes(fastify: FastifyInstance) {
  // Rotas de autenticação
  fastify.post(
    '/auth/register',
    { schema: registerSchema, preHandler: [] },
    registerUserController.createUser,
  );
  fastify.post(
    '/auth/login',
    { schema: loginSchema, preHandler: [] },
    loginUserController.loginUser,
  );
  fastify.post(
    '/auth/forgot-password',
    { schema: ForgotPasswordSchema },
    ForgotPasswordController.forgotPassword,
  );
  fastify.patch(
    '/auth/reset-password',
    { schema: resetPasswordSchema },
    ResetPasswordController.resetPassword,
  );

  fastify.post(
    '/auth/logout',
    { schema: logoutSchema, preHandler: [authMiddleware] },
    LogoutUserController.create,
  );

  // Rotas de usuário
  fastify.get(
    '/users/:id',
    { schema: getUserByIdSchema, preHandler: [authMiddleware] },
    GetUserByIdController.getUserById,
  );

  fastify.get(
    '/users',
    { schema: getAllUsersSchema, preHandler: [authMiddleware, verifyAdmin] },
    GetAllUsersController.getUsers,
  );
  fastify.delete(
    '/users',
    { schema: deleteUserSchema, preHandler: [authMiddleware, verifyAdmin] },
    DeleteUserController.deleteUser,
  );
}
