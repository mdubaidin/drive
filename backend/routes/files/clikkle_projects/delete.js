import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import File from '../../../schema/File.js';
import s3Client from '../../../libs/s3Client.js';
import { getAWSKey } from '../../../utils/functions.js';
import mongoose from 'mongoose';

const BUCKET = process.env.AWS_BUCKET_NAME;

export default async function (req, res, next) {
    let session = null;
    try {
        const files = req.body.files;
        const userId = req.params.id;

        if (!userId) Error.throw('userId must be provided to delete files');
        if (!files) Error.throw('Files are not found to delete');

        const dbFiles = await File.find({ _id: { $in: files }, userId, file: true }, { key: 1 });

        if (!dbFiles) Error.throw('Unable to find the file to delete', 404);

        session = await mongoose.startSession();
        session.startTransaction();

        const ROOT = `${userId}/files/`;

        const filesToDelete = dbFiles.map(({ _id, key }) => ({
            Key: getAWSKey(ROOT, key, _id),
        }));

        if (filesToDelete.length) {
            const deleteParams = {
                Bucket: BUCKET,
                Delete: {
                    Objects: filesToDelete,
                    Quiet: false,
                },
            };

            const command = new DeleteObjectsCommand(deleteParams);

            await s3Client.send(command);
        }

        await File.deleteMany({
            _id: { $in: files },
            userId,
            file: true,
        }).session(session);

        await session.commitTransaction();

        res.success({ message: 'file deleted sucessfully' });
    } catch (e) {
        next(e);
        session?.abortTransaction();
    } finally {
        session?.endSession();
    }
}
