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
                file: true,
                trash: false,
                favorite: true,
            },
            { favorite: false }
        );

        if (!acknowledged) {
            Error.throw('Something went wrong', 500);
        }

        modifiedCount
            ? res.success('file removed from favourite successfully')
            : res.error('failed to remvoe file from favourite');
    } catch (e) {
        next(e);
    }
}
