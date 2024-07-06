import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import File from '../../../schema/File.js';
import s3Client from '../../../libs/s3Client.js';
import { getAWSKey } from '../../../utils/functions.js';

const BUCKET = process.env.AWS_BUCKET_NAME;

export default async function (req, res, next) {
    try {
        const fileId = req.params.id;
        const ROOT = req.user.storagePath;
        const userId = req.user.id;

        const file = await File.findOne({ _id: fileId, userId, file: true }, { key: 1 });

        if (!file) Error.throw('Unable to find the file to delete', 404);

        const Key = getAWSKey(ROOT, file.key, fileId);

        const deleteParams = {
            Bucket: BUCKET,
            Key,
        };

        const command = new DeleteObjectCommand(deleteParams);

        await s3Client.send(command);

        await File.deleteOne({ _id: fileId, userId });

        res.success({ message: 'file deleted sucessfully' });
    } catch (e) {
        next(e);
    }
}
