import File from '../../schema/File.js';

export default async function (req, res, next) {
    try {
        const itemId = req.params.id;

        if (!itemId) Error.throw('itemId must be provided');

        const file = await File.findById(itemId, { access: 1 });

        if (!file) Error.throw('file not found', 404);

        res.success({ access: file.access.type === 'public' });
    } catch (e) {
        next(e);
    }
}
