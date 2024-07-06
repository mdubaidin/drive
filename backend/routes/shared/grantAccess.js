import { Types } from 'mongoose';
import File from '../../schema/File.js';

export default async function (req, res, next) {
    try {
        const { fileId, folderId, users, access } = req.body;
        const userId = req.user.id;

        if (!users.length) Error.throw('Must provide the user id and email whom you want to share');
        if (!(folderId || fileId)) Error.throw('file or folder id must be provided');

        //  remove duplicate entry before saving
        for (const userIndex in users) {
            const result = await File.find({
                _id: fileId || folderId,
                sharedWith: { $elemMatch: { userId: users[userIndex].id } },
            }).count();

            if (result) users.splice(userIndex, 1);
        }

        if (!users.length) return res.success('Access Updated');

        const shareWith = users.map(user => ({
            userId: new Types.ObjectId(user.id),
            email: user.email,
            access,
        }));

        const query = {
            available: true,
            trash: false,
            $or: [{ userId }, { sharedWith: { $elemMatch: { userId, access: 'editor' } } }],
        };

        if (folderId) {
            const { acknowledged: filesAcknowledged, modifiedCount: filesModified } =
                await File.updateMany(
                    {
                        key: { $regex: new RegExp(`${folderId}((\/[a-f0-9])+)?`) },
                        ...query,
                    },
                    { $addToSet: { sharedWith: { $each: shareWith } } }
                );

            const { acknowledged: folderAcknowledged, modifiedCount: folderModified } =
                await File.updateOne(
                    {
                        _id: folderId,
                        ...query,
                    },
                    {
                        $addToSet: {
                            sharedWith: { $each: shareWith },
                        },
                        $set: { showInShare: true },
                    }
                );

            if (!(filesAcknowledged || folderAcknowledged)) {
                Error.throw('Something went wrong', 500);
            }

            return filesModified || folderModified
                ? res.success('Access updated')
                : res.error('failed to update the access');
        }

        if (fileId) {
            const { acknowledged, modifiedCount } = await File.updateOne(
                {
                    _id: fileId,
                    ...query,
                },
                {
                    $addToSet: { sharedWith: { $each: shareWith } },
                    $set: { showInShare: true },
                }
            );

            if (!acknowledged) {
                Error.throw('Something went wrong', 500);
            }

            return modifiedCount
                ? res.success('Access updated')
                : res.error('failed to update the access');
        }
    } catch (e) {
        next(e);
    }
}
