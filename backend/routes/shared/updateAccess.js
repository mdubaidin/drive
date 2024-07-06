import File from '../../schema/File.js';

export default async function (req, res, next) {
    try {
        const { fileId, folderId, users } = req.body;
        const userId = req.user.id;
        console.log(users);

        if (!users.length)
            Error.throw('Must provide the user id and email whom you want to update');
        if (!(folderId || fileId)) Error.throw('file or folder id must be provided');

        const config = {
            available: true,
            trash: false,
            $or: [{ userId }, { sharedWith: { $elemMatch: { userId, access: 'editor' } } }],
        };

        for (const user of users) {
            if (fileId) {
                if (user.access === 'remove') {
                    await File.updateOne(
                        { _id: fileId, available: true, trash: false, file: true },
                        { $pull: { sharedWith: { userId: user.id } } }
                    );
                }

                await File.updateOne(
                    {
                        _id: fileId,
                        available: true,
                        file: true,
                        trash: false,
                        sharedWith: { $elemMatch: { userId: user.id } },
                    },
                    { $set: { 'sharedWith.$.access': user.access } }
                );

                return res.success('Access Updated');
            }

            if (folderId) {
                if (user.access === 'remove') {
                    await File.updateMany(
                        {
                            key: { $regex: new RegExp(`${folderId}((\/[a-f0-9])+)?`) },
                            ...config,
                            sharedWith: { $elemMatch: { userId: user.id } },
                        },
                        { $pull: { sharedWith: { userId: user.id } } }
                    );

                    await File.updateOne(
                        {
                            _id: folderId,
                            file: false,
                            ...config,
                            sharedWith: { $elemMatch: { userId: user.id } },
                        },
                        { $pull: { sharedWith: { userId: user.id } } }
                    );
                }

                await File.updateMany(
                    {
                        key: { $regex: new RegExp(`${folderId}((\/[a-f0-9])+)?`) },
                        ...config,
                        sharedWith: { $elemMatch: { userId: user.id } },
                    },
                    { $set: { 'sharedWith.$.access': user.access } }
                );

                await File.updateOne(
                    {
                        _id: folderId,
                        ...config,
                        sharedWith: { $elemMatch: { userId: user.id } },
                    },
                    { $set: { 'sharedWith.$.access': user.access } }
                );
            }
        }
        res.success('Access updated');
    } catch (e) {
        next(e);
    }
}
