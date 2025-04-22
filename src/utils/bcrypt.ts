import bcrypt from 'bcrypt';
import { envConfig } from '../config/envConfig';

export class BcryptUtils {
  public static async hashPassword(password: string): Promise<string> {
    const saltRounds = envConfig.BCRYPT_SALT_ROUNDS;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  public static async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  }
}
