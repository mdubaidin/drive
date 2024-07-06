import File from '../../schema/File.js';
import { copyObject, deleteObject, listObjects } from '../../utils/awsFunctions.js';
import { getAWSKey } from '../../utils/functions.js';

export default async function (req, res, next) {
    try {
        const items = req.body.items;
        const userId = req.user.id;
        const ROOT = req.user.storagePath;

        if (!items) Error.throw('Items are not selected to move');

        // Selected Files

        const destination = req.body.destination;

        if (items.files?.length) {
            const files = items.files.map(file => file._id);

            await File.updateMany(
                { _id: { $in: files }, userId, trash: false, available: true, file: true },
                { key: destination }
            );

            for (const file of items.files) {
                const sourceKey = getAWSKey(ROOT, file.key, file._id);
                const destinationKey = getAWSKey(ROOT, destination, file._id);

                await copyObject(sourceKey, destinationKey);
                await deleteObject(sourceKey);
            }
        }

        // Selected Folders

        if (items.folders?.length) {
            for (const folder of items.folders) {
                const sourceKey = `${folder.key ? folder.key + '/' : ''}${folder._id}`;
                const destinationKey = `${destination ? destination + '/' : ''}${folder._id}`;

                await File.updateMany(
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
                );

                await File.updateOne(
                    {
                        _id: folder._id,
                        userId,
                        trash: false,
                        showInTrash: false,
                        file: false,
                    },
                    { $set: { key: destination } }
                );

                const folderSourceKey = getAWSKey(ROOT, folder.key, folder._id);
                const folderDesKey = getAWSKey(ROOT, destination, folder._id);

                const objectToMove = await listObjects(folderSourceKey);

                if (objectToMove) {
                    for (const object of objectToMove) {
                        const fileSourceKey = object.Key;
                        const fileDesKey = fileSourceKey.replace(folderSourceKey, folderDesKey);

                        await copyObject(fileSourceKey, fileDesKey);
                        await deleteObject(fileSourceKey);
                    }
                }
            }
        }

        res.success({ message: 'Items moved successfully' });
    } catch (e) {
        next(e);
    }
}
