import File from '../../../schema/File.js';

export default function (isPublic) {
    return async function (req, res, next) {
        try {
            const { itemIds, access } = req.body;

            if (!itemIds) Error.throw('itemIds must be provided');

            if (isPublic) {
                if (!access) Error.throw('Access type of file must be provided');

                const { modifiedCount, acknowledged } = await File.updateMany(
                    { _id: { $in: itemIds }, available: true, trash: false },
                    { $set: { access: { type: 'public', access } } }
                );

                if (!acknowledged) {
                    Error.throw('Something went wrong', 500);
                }

                modifiedCount
                    ? res.success('Access updated successfully')
                    : res.error('failed to update the access');
            } else {
                const { modifiedCount, acknowledged } = await File.updateMany(
                    { _id: { $in: itemIds }, available: true, trash: false },
                    { $set: { access: { type: 'private', access: 'viewer' } } }
                );

                if (!acknowledged) {
                    Error.throw('Something went wrong', 500);
                }

                modifiedCount
                    ? res.success('Access updated successfully')
                    : res.error('failed to update the access');
            }
        } catch (e) {
            next(e);
        }
    };
}
