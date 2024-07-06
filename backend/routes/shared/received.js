import { Types } from 'mongoose';
import File from '../../schema/File.js';
import { getDateByFilter } from '../../utils/functions.js';
import filters from '../../services/filters.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;
        const folderId = req.params.folderId;
        const { type, modified, people, sort, direction } = req.query;

        const toFilter = [];

        filters[type]?.forEach(ext => toFilter.push(new RegExp(`\.${ext}$`, 'i')));

        const query = {
            available: true,
            trash: false,
        };

        if (people) query.userId = new Types.ObjectId(people);

        if (toFilter.length) query.name = { $in: toFilter };

        if (type === 'folders') query.file = false;

        if (!folderId) {
            const contents = await File.aggregate([
                {
                    $match: {
                        ...query,
                        sharedWith: { $elemMatch: { userId } },
                        showInShare: true,
                        $expr: getDateByFilter(modified, req.query),
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
                    $sort: { [sort || 'createdAt']: parseInt(direction) || 1 },
                },
            ]);
            return res.success({ contents });
        }

        const [folder] = await File.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(folderId),
                    available: true,
                    trash: false,
                    $or: [{ sharedWith: { $elemMatch: { userId } } }, { userId }],
                },
            },
            {
                $addFields: {
                    fullPath: {
                        $concat: [
                            {
                                $cond: {
                                    if: {
                                        $eq: ['$key', ''],
                                    },
                                    then: '',
                                    else: {
                                        $concat: ['$key', '/'],
                                    },
                                },
                            },
                            {
                                $toString: '$_id',
                            },
                        ],
                    },
                },
            },
            {
                $lookup: {
                    from: 'files',
                    localField: 'fullPath',
                    foreignField: 'key',
                    as: 'contents',
                    pipeline: [
                        {
                            $match: {
                                ...query,
                                $or: [{ sharedWith: { $elemMatch: { userId } } }, { userId }],
                                $expr: getDateByFilter(modified, req.query),
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
                            $sort: { [sort || 'createdAt']: parseInt(direction) || 1 },
                        },
                    ],
                },
            },
        ]);

        res.success({ contents: folder });
    } catch (e) {
        next(e);
    }
}
