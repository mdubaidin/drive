import File from '../../../schema/File.js';

export default async function (req, res, next) {
    try {
        const fileId = req.params.id;

        if (!fileId) Error.throw('fileId must be provided');

        const file = await File.findOne(
            {
                _id: fileId,
                'access.type': 'public',
                trash: false,
            },
            { name: 1, mimetype: 1, size: 1, userId: 1 }
        );

        if (!file) Error.throw('Your requested file is not available on the server', 404);

        res.success({ file });
    } catch (e) {
        next(e);
    }
}
