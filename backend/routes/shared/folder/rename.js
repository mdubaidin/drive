import File from '../../../schema/File.js';

export default async function (req, res, next) {
    try {
        const folderId = req.params.folderId;
        const name = req.body.name;

        const file = await File.findOne(
            {
                _id: folderId,
                trash: false,
            },
            { userId: 1 }
        );

        if (!file) Error.throw('File does not exists', 404);

        const { acknowledged, modifiedCount } = await File.updateOne(
            {
                _id: folderId,
                userId: file.userId,
                trash: false,
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
