import File from '../../schema/File.js';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import s3Client from '../../libs/s3Client.js';
import mongoose from 'mongoose';

const BUCKET = process.env.AWS_BUCKET_NAME;

export default async function (req, res, next) {
    let session = null;
    try {
        const userId = req.user.id;
        const ROOT = req.user.storagePath;

        session = await mongoose.startSession();
        session.startTransaction();

        const files = await File.find({ userId, trash: true }, { _id: 1, key: 1 });

        const objectToDelete = files.map(({ _id, key }) => {
            const id = _id.toString();

            return { Key: ROOT + (key ? key + '/' : '') + id };
        });

        const deleteParams = {
            Bucket: BUCKET,
            Delete: {
                Objects: objectToDelete,
                Quiet: false,
            },
        };

        const command = new DeleteObjectsCommand(deleteParams);

        await s3Client.send(command);

        await File.deleteMany({ userId, trash: true, available: true }).session(session);

        await session.commitTransaction();

        res.success();
    } catch (e) {
        next(e);
        session?.abortTransaction();
    } finally {
        session?.endSession();
    }
}
