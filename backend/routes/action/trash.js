import File from '../../schema/File.js';

export default async function (req, res, next) {
    try {
        const items = req.body.items;
        const userId = req.user.id;

        if (!items) Error.throw('Items are not selected for delete');

        const folders = items.folders.map(folderId => new RegExp(`${folderId}((\/[a-f0-9])+)?`));

        const { acknowledged: acknowledgedFolders } = await File.updateMany(
            {
                key: { $in: folders },
                userId,
                trash: false,
            },
            { trash: true }
        );

        const { acknowledged: acknowledgedFiles } = await File.updateMany(
            {
                _id: { $in: [...items.folders, ...items.files] },
                userId,
                trash: false,
                showInTrash: false,
            },
            { trash: true, showInTrash: true }
        );

        if (!(acknowledgedFolders || acknowledgedFiles)) {
            Error.throw('Something went wrong', 500);
        }

        res.success('items moved to trash successfully');
    } catch (e) {
        next(e);
    }
}
