import multer from 'fastify-multer';
import { join } from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, join(__dirname, '..', '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  },
});

export const upload = multer({ storage });
