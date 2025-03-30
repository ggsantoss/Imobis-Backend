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
import { blacklistMiddleware } from '../../middleware/blackListMiddleware';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.post('/register', registerUserController.createUser);
  fastify.post('/login', loginUserController.loginUser);
  fastify.delete(
    '/users',
    { preHandler: verifyAdmin },
    DeleteUserController.deleteUser,
  );
  fastify.get('/users/:id', GetUserByIdController.getUserById);
  fastify.get('/users', GetAllUsersController.getUsers);
  fastify.post('/logout', LogoutUserController.create);
  fastify.post('/reset_password', ForgotPasswordController.forgotPassword);
  fastify.patch('/change_password', ResetPasswordController.resetPassword);
}
