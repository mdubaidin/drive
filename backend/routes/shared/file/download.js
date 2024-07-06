import { GetObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../../../libs/s3Client.js';
const BUCKET = process.env.AWS_BUCKET_NAME;

export default function (action) {
    return async function (req, res, next) {
        try {
            const key = req.query.key;
            const userId = req.params.userId;

            const ROOT = `${userId}/files/`;

            const params = {
                Bucket: BUCKET,
                Key: `${ROOT + key}`,
            };

            const command = new GetObjectCommand(params);

            const response = await s3Client.send(command);
            const stream = response.Body;

            if (action === 'preview') {
                res.set('Cache-control', 'private, max-age=86400, must-revalidate');
                return stream.pipe(res);
            }

            res.setHeader('Content-Type', response.ContentType);
            stream.pipe(res);
        } catch (e) {
            next(e);
        }
    };
}
