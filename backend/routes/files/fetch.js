import File from '../../schema/File.js';

async function fetchById(req, res, next) {
    try {
        const fileId = req.params.id;
        const userId = req.user.id;

        if (!fileId) Error.throw('fileId must be provided');

        const file = await File.findOne({ _id: fileId, userId, available: true, trash: false });

        if (!file) Error.throw('Your requested file is not available on the server', 404);

        res.success({ file });
    } catch (e) {
        next(e);
    }
}

async function fetch(req, res, next) {
    try {
        const userId = req.user.id;
        const itemIds = req.body.itemIds;

        if (!itemIds) Error.throw('itemIds must be provided');
        if (!itemIds.length) Error.throw('itemIds must contains ids of files not be empty');

        const files = await File.find({
            _id: { $in: itemIds },
            userId,
            available: true,
            trash: false,
        });

        if (!files) Error.throw('Your requested files is not available on the server', 404);

        res.success({ files });
    } catch (e) {
        next(e);
    }
}

export { fetch, fetchById };
