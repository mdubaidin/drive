import File from '../../../schema/File.js';

export default async function (req, res, next) {
    try {
        const fileId = req.params.id;
        const userId = req.user.id;

        const file = await File.findOne({
            _id: fileId,
            trash: false,
            available: false,
            userId,
            file: true,
            'access.type': 'private',
        });

        if (!file) Error.throw('Your requested file is not available on the server', 404);

        res.success({ file });
    } catch (e) {
        next(e);
    }
}
