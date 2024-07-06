import File from '../../../schema/File.js';

export default async function (req, res, next) {
    try {
        const fileId = req.params.fileId;
        const userId = req.user.id;

        const { acknowledged, modifiedCount } = await File.updateOne(
            {
                _id: fileId,
                userId,
                available: true,
                trash: false,
                file: true,
                favorite: false,
            },
            { favorite: true }
        );

        if (!acknowledged) {
            Error.throw('Something went wrong', 500);
        }

        modifiedCount
            ? res.success('file added to favourite successfully')
            : res.error('failed to add file to favourite');
    } catch (e) {
        next(e);
    }
}
