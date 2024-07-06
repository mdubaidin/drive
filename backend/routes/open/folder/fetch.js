import { Types } from 'mongoose';
import File from '../../../schema/File.js';

export default async function (req, res, next) {
    try {
        const folderId = req.params.id;

        if (!folderId) Error.throw('folderId must be provided');

        const [folder] = await File.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(folderId),
                    available: true,
                    trash: false,
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

        if (!folder) Error.throw('Your requested folder is not available on the server', 404);

        res.success({ content: folder });
    } catch (e) {
        next(e);
    }
}
