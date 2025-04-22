import { BcryptUtils } from '../utils/bcrypt';
import bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashedPassword123'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('BcryptUtils', () => {
  describe('hashPassword', () => {
    it('should hash the password correctly', async () => {
      const password = 'mySecret123';
      const mockedHashedPassword = 'hashedPassword123';

      (bcrypt.hash as jest.Mock).mockResolvedValue(mockedHashedPassword);

      const hashedPassword = await BcryptUtils.hashPassword(password);

      expect(hashedPassword).toBe(mockedHashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(password, expect.any(String));
    });

    it('should throw error if hashing fails', async () => {
      const password = 'mySecret123';

      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash failed'));

      await expect(BcryptUtils.hashPassword(password)).rejects.toThrow(
        'Hash failed',
      );
    });
  });

  describe('comparePassword', () => {
    it('should return true when passwords match', async () => {
      const password = 'mySecret123';
      const hashedPassword = 'hashedPassword123';

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await BcryptUtils.comparePassword(
        password,
        hashedPassword,
      );

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should return false when passwords do not match', async () => {
      const password = 'mySecret123';
      const hashedPassword = 'hashedPassword123';

      // Mock da função bcrypt.compare
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await BcryptUtils.comparePassword(
        password,
        hashedPassword,
      );

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should throw error if comparison fails', async () => {
      const password = 'mySecret123';
      const hashedPassword = 'hashedPassword123';

      // Mock da falha do bcrypt.compare
      (bcrypt.compare as jest.Mock).mockRejectedValue(
        new Error('Comparison failed'),
      );

      await expect(
        BcryptUtils.comparePassword(password, hashedPassword),
      ).rejects.toThrow('Comparison failed');
    });
  });
});
