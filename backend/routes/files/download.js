import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../../libs/s3Client.js';

const BUCKET = process.env.AWS_BUCKET_NAME;

export default function (action) {
    return async function (req, res, next) {
        try {
            const key = req.query.key;
            const ROOT = req.user.storagePath;

            if (action === 'preview') {
                let range = req.headers.range;

                if (range) {
                    const listParams = {
                        Bucket: BUCKET,
                        Key: `${ROOT + key}`,
                    };

                    const data = await s3Client.send(new HeadObjectCommand(listParams));

                    let bytes = range.replace(/bytes=/, '').split('-');
                    let start = Number(bytes[0]);
                    let chunksize = 10 ** 6;
                    let total = data.ContentLength;
                    let end = Math.min(start + chunksize, total - 1);
                    const ContentLength = end - start + 1;

                    res.writeHead(206, {
                        'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
                        'Accept-Ranges': 'bytes',
                        'Content-Length': ContentLength,
                        'Content-Type': data.ContentType,
                    });

                    const params = {
                        Bucket: BUCKET,
                        Key: `${ROOT + key}`,
                        Range: range,
                    };

                    const command = new GetObjectCommand(params);

                    const response = await s3Client.send(command);

                    return response.Body.pipe(res);
                } else {
                    const params = {
                        Bucket: BUCKET,
                        Key: `${ROOT + key}`,
                    };

                    const command = new GetObjectCommand(params);

                    const response = await s3Client.send(command);
                    const stream = response.Body;

                    res.set('Cache-control', 'private, max-age=86400, must-revalidate');
                    return stream.pipe(res);
                }
            }

            const params = {
                Bucket: BUCKET,
                Key: `${ROOT + key}`,
            };

            const command = new GetObjectCommand(params);

            const response = await s3Client.send(command);
            const stream = response.Body;

            res.setHeader('Content-Type', response.ContentType);
            stream.pipe(res);
        } catch (e) {
            next(e);
        }
    };
}
