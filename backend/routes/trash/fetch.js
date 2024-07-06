import File from '../../schema/File.js';
import filters from '../../services/filters.js';
import { getDateByFilter } from '../../utils/functions.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;
        const { type, modified, direction, sort } = req.query;

        const toFilter = [];

        filters[type]?.forEach(ext => toFilter.push(new RegExp(`\.${ext}$`, 'i')));

        const query = {
            userId,
            available: true,
            trash: true,
            showInTrash: true,
            $expr: getDateByFilter(modified, req.query),
        };

        if (toFilter.length) query.name = { $in: toFilter };

        if (type === 'folders') query.file = false;

        const contents = await File.find({
            ...query,
        }).sort({ [sort || 'updatedAt']: parseInt(direction) || -1 });

        res.success({ contents });
    } catch (e) {
        next(e);
    }
}
