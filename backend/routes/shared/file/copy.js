import mongoose, { Types } from 'mongoose';
import File from '../../../schema/File.js';
import { copyObject } from '../../../utils/awsFunctions.js';
import { getAWSKey } from '../../../utils/functions.js';

export default async function (req, res, next) {
    let session = null;
    try {
        const ROOT = req.user.storagePath;
        const userId = req.user.id;
        const { fileId, ownerId } = req.body;

        session = await mongoose.startSession();
        session.startTransaction();

        const file = await File.findOne({
            _id: fileId,
            userId: ownerId,
            file: true,
            trash: false,
        });

        if (!file) Error.throw('File does not exists', 404);

        const { _id, mimetype, size, key, name, available } = file;

        const source = getAWSKey(`${ownerId}/files/`, key, _id);

        const newId = new Types.ObjectId();

        const destination = getAWSKey(ROOT, key, newId);

        await copyObject(source, destination);

        const prefix = 'Copy of ';

        const newName = name.includes(prefix) ? name : prefix + name;

        const copyFile = new File({
            _id: newId,
            mimetype,
            size,
            userId,
            key,
            name: newName,
            available,
        });

        await copyFile.save({ session });

        await session.commitTransaction();

        res.success({ message: 'file copied sucessfully' });
    } catch (e) {
        next(e);
        session?.abortTransaction();
    } finally {
        session?.endSession();
    }
}
