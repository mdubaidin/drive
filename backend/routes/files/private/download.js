import { GetObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../../../libs/s3Client.js';
import File from '../../../schema/File.js';
import { getAWSKey } from '../../../utils/functions.js';

const BUCKET = process.env.AWS_BUCKET_NAME;

export default async function (req, res, next) {
    try {
        const fileId = req.params.id;
        const ROOT = req.user.storagePath;
        const userId = req.user.id;

        const file = await File.findOne({
            _id: fileId,
            available: false,
            userId,
            trash: false,
            file: true,
        });

        if (!file) Error.throw('Your requested file is not available on the server', 404);

        const { _id, key } = file;

        const params = {
            Bucket: BUCKET,
            Key: getAWSKey(ROOT, key, _id),
        };

        const command = new GetObjectCommand(params);

        const response = await s3Client.send(command);
        const stream = response.Body;

        res.setHeader('Content-Type', response.ContentType);
        stream.pipe(res);
    } catch (e) {
        next(e);
    }
}
