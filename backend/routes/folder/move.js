import File from '../../schema/File.js';
import { getAWSKey } from '../../utils/functions.js';
import mongoose from 'mongoose';
import { copyObject, deleteObject, listObjects } from '../../utils/awsFunctions.js';

export default async function (req, res, next) {
    let session = null;
    try {
        const userId = req.user.id;
        const ROOT = req.user.storagePath;
        const { destination, folderId, folderKey } = req.body;

        session = await mongoose.startSession();
        session.startTransaction();

        const sourceKey = `${folderKey ? folderKey + '/' : ''}${folderId}`;
        const destinationKey = `${destination ? destination + '/' : ''}${folderId}`;

        const { modifiedCount, acknowledged } = await File.updateMany(
            {
                key: {
                    $regex: new RegExp(`${sourceKey}((\/[a-f0-9])+)?`, 'gi'),
                },
                userId,
                trash: false,
            },
            [
                {
                    $set: {
                        key: {
                            $replaceOne: {
                                input: '$key',
                                find: sourceKey,
                                replacement: destinationKey,
                            },
                        },
                    },
                },
            ]
        ).session(session);
        await File.updateOne(
            {
                _id: folderId,
                userId,
                trash: false,
                showInTrash: false,
                file: false,
            },
            { $set: { key: destination } }
        ).session(session);

        const folderSourceKey = getAWSKey(ROOT, folderKey, folderId);
        const folderDesKey = getAWSKey(ROOT, destination, folderId);

        const objectToMove = await listObjects(folderSourceKey);

        if (objectToMove) {
            for (const object of objectToMove) {
                const fileSourceKey = object.Key;
                const fileDesKey = fileSourceKey.replace(folderSourceKey, folderDesKey);

                await copyObject(fileSourceKey, fileDesKey);
                await deleteObject(fileSourceKey);
            }
        }

        if (!acknowledged) {
            Error.throw('Something went wrong', 500);
        }

        await session.commitTransaction();

        modifiedCount
            ? res.success('Folder moved successfully')
            : res.error('Failed to move the folder');
    } catch (e) {
        next(e);
        session?.abortTransaction();
    } finally {
        session?.endSession();
    }
}
