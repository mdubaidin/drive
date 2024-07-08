import { Types } from 'mongoose';
import File from '../../schema/File.js';
import User from '../../schema/User.js';
// import User from '../../schema/User.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;

        if (!userId) Error.throw('userId must be provided');

        const { storage } = await User.findById(userId, { storage: 1, _id: 0 });

        const [used] = await File.aggregate([
            {
                $match: {
                    userId,
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
        ]);

        res.success({ stats: { used: used || 0, storage } });
    } catch (e) {
        next(e);
    }
}
