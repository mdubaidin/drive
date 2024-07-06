import File from '../../schema/File.js';
import filters from '../../services/filters.js';
import { getDateByFilter } from '../../utils/functions.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;
        const { type, modified, sort, direction } = req.query;

        const toFilter = [];

        filters[type]?.forEach(ext => toFilter.push(new RegExp(`\.${ext}$`, 'i')));

        const query = {
            userId,
            available: true,
            trash: false,
            favorite: true,
            showInTrash: false,
            $expr: getDateByFilter(modified, req.query),
        };

        if (toFilter.length) query.name = { $in: toFilter };

        if (type === 'folders') query.file = false;

        const contents = await File.aggregate([
            {
                $match: {
                    ...query,
                },
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $addFields: {
                    email: {
                        $arrayElemAt: ['$user.email', 0],
                    },
                },
            },
            {
                $project: { user: 0 },
            },
            {
                $sort: { [sort || 'createdAt']: parseInt(direction) || -1 },
            },
        ]);

        res.success({ contents });
    } catch (e) {
        next(e);
    }
}
