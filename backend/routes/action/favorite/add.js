import File from '../../../schema/File.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;
        const items = req.body.items;

        if (!items) Error.throw('Items are not selected to add in favorite');

        const { acknowledged, modifiedCount } = await File.updateMany(
            {
                _id: { $in: [...items.files, ...items.folders] },
                userId,
                available: true,
                trash: false,
                favorite: false,
            },
            { favorite: true }
        );

        if (!acknowledged) {
            Error.throw('Something went wrong', 500);
        }

        modifiedCount
            ? res.success('items added to favourite successfully')
            : res.error('failed to add items to favourite');
    } catch (e) {
        next(e);
    }
}
