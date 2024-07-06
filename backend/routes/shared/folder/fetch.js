import { Types } from 'mongoose';
import File from '../../../schema/File.js';

export default async function (req, res, next) {
    try {
        const folderId = req.params.id;
        const id = req.query.user;
        const userId = new Types.ObjectId(id);
        const itemId = new Types.ObjectId(folderId);

        const query = {
            available: true,
            trash: false,
            sharedWith: { $elemMatch: { userId } },
        };

        let folder = null;

        [folder] = await File.aggregate([
            {
                $match: {
                    _id: itemId,
                    ...query,
                    showInShare: true,
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
                    ],
                },
            },
        ]);

        if (!folder)
            [folder] = await File.aggregate([
                {
                    $match: {
                        _id: itemId,
                        userId,
                        available: true,
                        trash: false,
                        showInShare: true,
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
                                    available: true,
                                    trash: false,
                                    userId,
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
                        ],
                    },
                },
            ]);

        if (!folder) return res.error('User does not have permission to view this folder', 401);

        res.success({ content: folder });
    } catch (e) {
        next(e);
    }
}
