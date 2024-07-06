import File from '../../../schema/File.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;
        const items = req.body.items;

        if (!items) Error.throw('Items are not selected to remove from favorite');

        const { acknowledged, modifiedCount } = await File.updateMany(
            {
                _id: { $in: [...items.files, ...items.folders] },
                userId,
                available: true,
                trash: false,
                favorite: true,
            },
            { favorite: false }
        );

        if (!acknowledged) {
            Error.throw('Something went wrong', 500);
        }

        modifiedCount
            ? res.success('items removed from favourite successfully')
            : res.error('failed to remvoe items from favourite');
    } catch (e) {
        next(e);
    }
}
