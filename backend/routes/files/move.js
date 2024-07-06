import File from '../../schema/File.js';
import { getAWSKey } from '../../utils/functions.js';
import mongoose from 'mongoose';
import { copyObject, deleteObject } from '../../utils/awsFunctions.js';

export default async function (req, res, next) {
    let session = null;
    try {
        const userId = req.user.id;
        const ROOT = req.user.storagePath;
        const { destination, fileId, fileKey } = req.body;

        console.log({ destination, fileId, fileKey });

        session = await mongoose.startSession();
        session.startTransaction();

        const { modifiedCount, acknowledged } = await File.updateOne(
            { _id: fileId, userId, trash: false, available: true, file: true },
            { key: destination }
        ).session(session);

        const fileSourceKey = getAWSKey(ROOT, fileKey, fileId);
        const fileDesKey = getAWSKey(ROOT, destination, fileId);

        await copyObject(fileSourceKey, fileDesKey);

        await deleteObject(fileSourceKey);

        if (!acknowledged) {
            Error.throw('Something went wrong', 500);
        }

        await session.commitTransaction();

        res.success(modifiedCount ? 'File moved successfully' : 'failed to move the file');
    } catch (e) {
        next(e);
        session?.abortTransaction();
    } finally {
        session?.endSession();
    }
}
