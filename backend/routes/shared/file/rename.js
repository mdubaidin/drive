import File from '../../../schema/File.js';

export default async function (req, res, next) {
    try {
        const fileId = req.params.fileId;
        const name = req.body.name;
        const userId = req.user.id;

        const file = await File.findOne(
            {
                _id: fileId,
                file: true,
                trash: false,
                $or: [{ userId }, { sharedWith: { $elemMatch: { userId, access: 'editor' } } }],
            },
            { userId: 1 }
        );

        if (!file) Error.throw('File does not exists', 404);

        const { acknowledged, modifiedCount } = await File.updateOne(
            {
                _id: fileId,
                userId: file.userId,
                available: true,
                trash: false,
                file: true,
            },
            { name }
        );

        if (!acknowledged) {
            Error.throw('Something went wrong', 500);
        }

        res.success(modifiedCount ? 'file rename successfully' : 'failed to rename the file');
    } catch (e) {
        next(e);
    }
}
