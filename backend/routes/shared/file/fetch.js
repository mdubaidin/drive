import { Types } from 'mongoose';
import File from '../../../schema/File.js';

export default async function (req, res, next) {
    try {
        const fileId = req.params.id;
        const id = req.query.user;
        const userId = new Types.ObjectId(id);
        const itemId = new Types.ObjectId(fileId);

        let file = null;

        [file] = await File.aggregate([
            {
                $match: {
                    _id: itemId,
                    available: true,
                    trash: false,
                    sharedWith: { $elemMatch: { userId } },
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
        ]);

        if (!file)
            [file] = await File.aggregate([
                {
                    $match: {
                        _id: itemId,
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
            ]);

        if (!file) return res.error('User does not have permission to view this file', 401);

        res.success({ file });
    } catch (e) {
        next(e);
    }
}
