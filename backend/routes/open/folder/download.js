import { GetObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../../../libs/s3Client.js';
import archiver from 'archiver';
import { getAWSKey } from '../../../utils/functions.js';
import File from '../../../schema/File.js';

const BUCKET = process.env.AWS_BUCKET_NAME;

export default async function (req, res, next) {
    try {
        const folderId = req.params.id;

        const folder = await File.findById(
            { _id: folderId, 'access.type': 'public' },
            { userId: 1 }
        );

        if (!folder) Error.throw('Your requested folder is not available on the server', 404);

        const ROOT = `${folder.userId}/files/`;

        const files = await File.find({
            key: { $regex: new RegExp(`${folderId}((\/[a-f0-9])+)?`) },
            userId: folder.userId,
            trash: false,
            file: true,
        });

        const archive = archiver('zip', { zlib: { level: 9 } });

        const fileName = `files-download-${Date.now()}.zip`;

        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/zip');

        archive.pipe(res);

        for (const file of files) {
            const params = {
                Bucket: BUCKET,
                Key: getAWSKey(ROOT, file.key, file._id),
            };

            const command = new GetObjectCommand(params);

            const response = await s3Client.send(command);
            const stream = response.Body;

            archive.append(stream, { name: file.name });
        }

        archive.finalize();
    } catch (e) {
        next(e);
    }
}
