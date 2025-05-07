import cron from 'node-cron';
import { prisma } from '../db/prisma';

export function scheduleExpirePaidVisibility() {
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Verifying expired advertisements...');
    const now = new Date();

    await prisma.ad.updateMany({
      where: {
        paid_visibility_expires_at: {
          lte: now,
        },
        paid_visible: true,
      },
      data: {
        paid_visible: false,
        paid_visibility_expires_at: null,
      },
    });
    console.log('[CRON] Expired advertisement has been updated.');
  });
}
