import File from '../../../schema/File.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;

        const files = await File.find({
            userId,
            available: true,
            file: true,
            trash: false,
            favorite: true,
        });

        res.success({ files });
    } catch (e) {
        next(e);
    }
}
