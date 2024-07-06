import File from '../../schema/File.js';

export default async function (req, res, next) {
    try {
        const folderId = req.params.folderId;
        const userId = req.user.id;

        if (!folderId) {
            const folders = req.body.folders;

            const items = folders.map(folder => new RegExp(`${folder}((\/[a-f0-9])+)?`));
            const dbFolders = await File.find({
                key: { $nin: items },
                userId,
                file: false,
                trash: false,
                showInTrash: false,
            });
            return res.success({ folders: dbFolders });
        }

        const folder = await File.findOne({ _id: folderId, userId, file: false, trash: false });
        res.success({ folder });
    } catch (e) {
        next(e);
    }
}
