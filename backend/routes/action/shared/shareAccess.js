import { Types } from 'mongoose';
import File from '../../../schema/File.js';

export default async function (req, res, next) {
    try {
        const { items, users, access } = req.body;

        if (!items) Error.throw('Items are not selected for update');

        // Selected Files

        //  remove duplicate entry before saving
        for (const item of [...items.files, ...items.folders]) {
            const usersToShare = [...users];

            for (const userIndex in usersToShare) {
                const result = await File.find({
                    _id: item._id,
                    sharedWith: { $elemMatch: { userId: usersToShare[userIndex].id } },
                }).count();

                if (result) usersToShare.splice(userIndex, 1);
            }

            const shareWith = usersToShare.map(user => ({
                userId: new Types.ObjectId(user.id),
                email: user.email,
                access,
            }));

            if (!item.file)
                await File.updateMany(
                    {
                        key: { $regex: new RegExp(`${item._id}((\/[a-f0-9])+)?`) },
                        trash: false,
                        available: true,
                    },
                    { $addToSet: { sharedWith: { $each: shareWith } } }
                );

            await File.updateMany(
                {
                    _id: item._id,
                    trash: false,
                    available: true,
                },
                {
                    $addToSet: { sharedWith: { $each: shareWith } },
                    $set: { showInShare: true },
                }
            );
        }

        res.success({ message: 'Access updated' });
    } catch (e) {
        next(e);
    }
}
