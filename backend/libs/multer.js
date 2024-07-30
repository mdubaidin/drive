import multer from 'multer';
import path from 'path';

const upload = multer({
    storage: multer.diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 * 1024 },
});

export default upload;
