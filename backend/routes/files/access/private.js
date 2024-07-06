import File from '../../../schema/File.js';

export default async function (req, res, next) {
    try {
        const fileId = req.params.id;

        if (!fileId) Error.throw('fileId must be provided');

        const { acknowledged, modifiedCount, matchedCount } = await File.updateOne(
            { _id: fileId },
            { 'access.type': 'private' }
        );

        if (!acknowledged) Error.throw('Something went wrong, cannot update the access level', 500);

        if (matchedCount === 0) Error.throw('File not found on the server with id ' + fileId, 404);

        if (modifiedCount === 0) return res.success('No changes made in file');

        res.success('File access level changed to private');
    } catch (e) {
        next(e);
    }
}
