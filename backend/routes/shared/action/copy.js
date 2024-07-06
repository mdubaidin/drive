import mongoose, { Types } from 'mongoose';
import File from '../../../schema/File.js';
import { copyObject } from '../../../utils/awsFunctions.js';
import { getAWSKey } from '../../../utils/functions.js';

export default async function (req, res, next) {
    let session = null;
    try {
        const userId = req.params.id;
        const files = req.body.items;
        const ROOT = `${userId}/files/`;

        if (!files?.length) Error.throw('Items are not selected for copy');

        session = await mongoose.startSession();
        session.startTransaction();

        const dbFiles = await File.find({
            _id: { $in: files },
            file: true,
            trash: false,
        });

        if (!dbFiles.length) Error.throw('File does not exists', 404);

        for (const file of dbFiles) {
            const { _id, mimetype, size, key, name, available } = file;

            const source = getAWSKey(`${file.userId}/files/`, key, _id);

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
                name: newName,
                available,
            });
            await copyFile.save({ session });
        }

        await session.commitTransaction();

        res.success({ message: 'files copied sucessfully' });
    } catch (e) {
        next(e);
        session?.abortTransaction();
    } finally {
        session?.endSession();
    }
}
