import File from '../../schema/File.js';

export default async function (req, res, next) {
    try {
        const fileId = req.params.id;
        const userId = req.user.id;
        const name = req.body.name;

        const { acknowledged, modifiedCount } = await File.updateOne(
            {
                _id: fileId,
                userId,
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
