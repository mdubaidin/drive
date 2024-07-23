import mongoose from 'mongoose';
import { uploadFile } from '../../../utils/asyncFunctions.js';

export default async function (req, res, next) {
    let session = null;
    try {
        const files = req.files.files;
        const userId = req.user.id;
        const platform = req.params.platform;
        const ROOT = req.user.storagePath;

        if (!ROOT) Error.throw('Provide ROOT path to upload file');

        if (!files) Error.throw('You have not selected any files');
        if (!platform) Error.throw('platform must be provided to upload files');

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
                platform,
            });

            if (data) uploaded.push(data);
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
