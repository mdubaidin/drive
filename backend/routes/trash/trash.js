import File from '../../schema/File.js';

export default async function (req, res, next) {
    try {
        const fileId = req.params.fileId;
        const folderId = req.params.folderId;
        const userId = req.user.id;

        if (folderId) {
            const { acknowledged: filesAcknowledged, modifiedCount: filesModified } =
                await File.updateMany(
                    {
                        key: { $regex: new RegExp(`${folderId}((\/[a-f0-9])+)?`) },
                        userId,
                        trash: false,
                    },
                    { trash: true }
                );

            const { acknowledged: folderAcknowledged, modifiedCount: folderModified } =
                await File.updateOne(
                    { _id: folderId, userId, trash: false, showInTrash: false },
                    { trash: true, showInTrash: true }
                );

            if (!(filesAcknowledged || folderAcknowledged)) {
                Error.throw('Something went wrong', 500);
            }

            return filesModified || folderModified
                ? res.success('Folder moved to trash successfully')
                : res.error('failed to move the folder in trash');
        }

        if (fileId) {
            const { modifiedCount, acknowledged } = await File.updateOne(
                {
                    _id: fileId,
                    userId,
                    available: true,
                    trash: false,
                    file: true,
                    showInTrash: false,
                },
                { trash: true, showInTrash: true }
            );

            if (!acknowledged) {
                Error.throw('Something went wrong', 500);
            }

            return modifiedCount
                ? res.success('File moved to trash successfully')
                : res.error('failed to move the file in trash');
        }
    } catch (e) {
        next(e);
    }
}
