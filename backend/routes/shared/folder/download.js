import archiver from 'archiver';
import File from '../../../schema/File.js';
import { downloadFolder } from '../../../utils/asyncFunctions.js';

export default async function (req, res, next) {
    try {
        const folderId = req.params.folderId;

        const folder = await File.findOne(
            {
                _id: folderId,
            },
            { userId: 1 }
        );

        if (!folder) Error.throw('Folder does not exists', 404);

        const userId = folder.userId;
        const ROOT = `${userId}/files/`;

        const files = await File.find({
            key: { $regex: new RegExp(`${folderId}((\/[a-f0-9])+)?`) },
            userId,
            trash: false,
            file: true,
        });

        const archive = archiver('zip', { zlib: { level: 9 } });

        const fileName = `files-download-${Date.now()}.zip`;

        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/zip');

        archive.pipe(res);

        await downloadFolder({ ROOT, files, archive });

        archive.finalize();
    } catch (e) {
        next(e);
    }
}
