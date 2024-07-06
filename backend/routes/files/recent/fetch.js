import File from '../../../schema/File.js';
import filters from '../../../services/filters.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;
        const { type } = req.query;

        const toFilter = [];

        filters[type]?.forEach(ext => toFilter.push(new RegExp(`\.${ext}$`, 'i')));

        const typeQuery = type === 'folders' ? { file: false } : { name: { $in: toFilter } };

        const config = {
            trash: false,
            file: true,
            available: true,
            userId,
            ...(type && typeQuery),
        };

        const response = await File.aggregate([
            {
                $match: {
                    ...config,
                },
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: {
                                $gte: [
                                    '$createdAt',
                                    {
                                        $dateAdd: {
                                            startDate: '$$NOW',
                                            unit: 'day',
                                            amount: -1,
                                        },
                                    },
                                ],
                            },
                            then: 'day',
                            else: {
                                $cond: {
                                    if: {
                                        $gte: [
                                            '$createdAt',
                                            {
                                                $dateAdd: {
                                                    startDate: '$$NOW',
                                                    unit: 'week',
                                                    amount: -1,
                                                },
                                            },
                                        ],
                                    },
                                    then: 'week',
                                    else: {
                                        $cond: {
                                            if: {
                                                $gte: [
                                                    '$createdAt',
                                                    {
                                                        $dateAdd: {
                                                            startDate: '$$NOW',
                                                            unit: 'month',
                                                            amount: -1,
                                                        },
                                                    },
                                                ],
                                            },
                                            then: 'month',
                                            else: {
                                                $cond: {
                                                    if: {
                                                        $gte: [
                                                            '$createdAt',
                                                            {
                                                                $dateAdd: {
                                                                    startDate: '$$NOW',
                                                                    unit: 'year',
                                                                    amount: -1,
                                                                },
                                                            },
                                                        ],
                                                    },
                                                    then: 'year',
                                                    else: 'older',
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    files: {
                        $push: '$$CURRENT',
                    },
                },
            },
            {
                $sort: { 'files.createdAt': -1 },
            },
        ]);

        res.success({ files: response });
    } catch (e) {
        next(e);
    }
}
