import { Types } from 'mongoose';
import File from '../../schema/File.js';
// import User from '../../schema/User.js';

export default async function (req, res, next) {
    try {
        const userId = req.params.id;

        if (!userId) Error.throw('userId must be provided');

        const [stats] = await File.aggregate([
            [
                {
                    $match: {
                        userId: new Types.ObjectId(userId),
                        file: true,
                    },
                },
                {
                    $group: {
                        _id: '$userId',
                        used: {
                            $sum: '$size',
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                {
                    $addFields: {
                        storage: {
                            $arrayElemAt: ['$user.storage', 0],
                        },
                    },
                },
                {
                    $project: {
                        used: 1,
                        storage: 1,
                    },
                },
            ],
        ]);

        res.success({ stats });
    } catch (e) {
        next(e);
    }
}
