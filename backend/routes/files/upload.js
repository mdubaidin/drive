import mongoose from 'mongoose';
import { getParentId } from '../../utils/functions.js';
import { addSharedWith, uploadFile } from '../../utils/asyncFunctions.js';

export default async function (req, res, next) {
    let session = null;
    try {
        const files = req.files.files;
        const userId = req.user.id;
        const parentKey = req.query.parentKey || '';
        const ROOT = req.user.storagePath;

        if (!ROOT) Error.throw('Provide ROOT path to upload file');

        if (!files) Error.throw('You have not selected any files');

        session = await mongoose.startSession();
        session.startTransaction();

        const parentId = getParentId(parentKey);

        const { sharedWith, ownerId } = await addSharedWith(parentId, userId);

        for (const file of files) {
            await uploadFile({
                userId: ownerId,
                parentKey,
                ROOT,
                file,
                session,
                sharedWith,
            });
        }

        await session.commitTransaction();

        res.success({ message: 'file uploaded sucessfully' });
    } catch (e) {
        next(e);
        session?.abortTransaction();
    } finally {
        session?.endSession();
    }
}
