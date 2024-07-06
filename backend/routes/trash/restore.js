import File from '../../schema/File.js';

export default async function (req, res, next) {
    try {
        const fileId = req.params.fileId;
        const folderId = req.params.folderId;
        const items = req.body.items;
        const userId = req.user.id;

        if (folderId) {
            const { acknowledged, modifiedCount } = await File.updateMany(
                {
                    key: { $regex: new RegExp(`${folderId}((\/[a-f0-9])+)?`) },
                    userId,
                    trash: true,
                },
                { trash: false }
            );

            await File.updateOne(
                { _id: folderId, userId, trash: true, showInTrash: true },
                { trash: false, showInTrash: false }
            );

            if (!acknowledged) {
                Error.throw('Something went wrong', 500);
            }

            return res.success(
                modifiedCount ? 'Folder restored successfully' : 'failed to restored the folder'
            );
        }

        if (fileId) {
            const { acknowledged, modifiedCount } = await File.updateOne(
                {
                    _id: fileId,
                    userId,
                    available: true,
                    trash: true,
                },
                { trash: false, showInTrash: false }
            );

            if (!acknowledged) {
                Error.throw('Something went wrong', 500);
            }

            return res.success(
                modifiedCount ? 'File restored successfully' : 'failed to restored the file'
            );
        }

        if (!items) Error.throw('Items are not found to restore');

        const folders = items.folders.map(folder => new RegExp(`${folder}((\/[a-f0-9])+)?`));

        const { acknowledged: acknowledgedFolders, modifiedCount: modifiedFolders } =
            await File.updateMany(
                {
                    key: { $in: folders },
                    userId,
                    trash: true,
                },
                { trash: false }
            );
        const { acknowledged: acknowledgedFiles, modifiedCount: modifiedFiles } =
            await File.updateMany(
                {
                    _id: { $in: [...items.folders, ...items.files] },
                    userId,
                    trash: true,
                    showInTrash: true,
                },
                { trash: false, showInTrash: false }
            );

        // await File.updateMany(
        //     {
        //         _id: { $in: items.files },
        //         userId,
        //         trash: false,
        //         file: true,
        //     },
        //     { trash: true, showInTrash: true }
        // );
        if (!(acknowledgedFolders || acknowledgedFiles)) {
            Error.throw('Something went wrong', 500);
        }

        res.success(
            modifiedFiles && modifiedFolders
                ? 'items are restored successfully'
                : 'failed to restored the items'
        );
    } catch (e) {
        next(e);
    }
}
