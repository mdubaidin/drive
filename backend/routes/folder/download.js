import archiver from 'archiver';
import File from '../../schema/File.js';
import { downloadFolder } from '../../utils/asyncFunctions.js';

export default async function (req, res, next) {
    try {
        const ROOT = req.user.storagePath;
        const userId = req.user.id;
        const folderId = req.params.folderId;

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
