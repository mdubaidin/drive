import File from '../../../schema/File.js';

export default async function (req, res, next) {
    try {
        const folderId = req.params.folderId;
        const userId = req.user.id;

        const { acknowledged, modifiedCount } = await File.updateOne(
            {
                _id: folderId,
                userId,
                trash: false,
                file: false,
                showInTrash: false,
                favorite: false,
            },
            { favorite: true }
        );

        if (!acknowledged) {
            Error.throw('Something went wrong', 500);
        }

        modifiedCount
            ? res.success('folder added to favourite successfully')
            : res.error('failed to add folder to favourite');
    } catch (e) {
        next(e);
    }
}
