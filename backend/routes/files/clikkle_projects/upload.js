import mongoose from 'mongoose';
import { uploadFile } from '../../../utils/asyncFunctions.js';

export default async function (req, res, next) {
    let session = null;
    try {
        const files = req.files.files;
        const userId = req.params.id;

        console.log({ files, userId });
        if (!files) Error.throw('You have not selected any files');
        if (!userId) Error.throw('userId must be provided to upload files');

        const ROOT = `${userId}/files/`;

        session = await mongoose.startSession();
        session.startTransaction();

        const uploaded = [];

        for (const file of files) {
            const data = await uploadFile({
                userId,
                ROOT,
                parentKey: '',
                file,
                available: false,
                session,
                platform: 'projects',
            });
            uploaded.push(data._id);
        }

        await session.commitTransaction();

        res.success({ message: 'file uploaded sucessfully', uploaded });
    } catch (e) {
        next(e);
        session?.abortTransaction();
    } finally {
        session?.endSession();
    }
}
