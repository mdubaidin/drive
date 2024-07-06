import File from '../../schema/File.js';

export default async function (req, res, next) {
    try {
        const folderId = req.params.folderId;
        const userId = req.user.id;
        const name = req.body.name;

        const { acknowledged, modifiedCount } = await File.updateOne(
            {
                _id: folderId,
                userId,
                available: true,
                trash: false,
                file: false,
            },
            { name }
        );

        if (!acknowledged) {
            Error.throw('Something went wrong', 500);
        }

        res.success(modifiedCount ? 'folder rename successfully' : 'failed to rename the folder');
    } catch (e) {
        next(e);
    }
}
