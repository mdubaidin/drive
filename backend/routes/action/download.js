import { GetObjectCommand } from '@aws-sdk/client-s3';
import s3Client from '../../libs/s3Client.js';
import archiver from 'archiver';
import { getAWSKey } from '../../utils/functions.js';
import File from '../../schema/File.js';
import { downloadFolder } from '../../utils/asyncFunctions.js';

const BUCKET = process.env.AWS_BUCKET_NAME;

export default async function (req, res, next) {
    try {
        const ROOT = req.user.storagePath;
        const userId = req.user.id;
        const items = req.body.items;

        if (!items) Error.throw('Items are not selected for download');

        if (items.files.length === 1) {
            console.log('files');
            const file = items.files.at(0);
            const params = {
                Bucket: BUCKET,
                Key: getAWSKey(ROOT, file.key, file._id),
            };

            const command = new GetObjectCommand(params);

            const response = await s3Client.send(command);
            const stream = response.Body;

            res.setHeader('Content-Type', response.ContentType);
            return stream.pipe(res);
        }

        const archive = archiver('zip', { zlib: { level: 9 } });

        const fileName = `files-download-${Date.now()}.zip`;

        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/zip');

        archive.pipe(res);

        const files = items.files.map(file => ({
            name: file.name,
            key: getAWSKey(ROOT, file.key, file._id),
        }));

        for (const file of files) {
            const params = {
                Bucket: BUCKET,
                Key: file.key,
            };

            const command = new GetObjectCommand(params);

            const response = await s3Client.send(command);
            const stream = response.Body;

            archive.append(stream, { name: file.name });
        }

        if (items.folders?.length) {
            for (const folder of items.folders) {
                const files = await File.find({
                    key: { $regex: new RegExp(`${folder._id}((\/[a-f0-9])+)?`) },
                    userId,
                    trash: false,
                    file: true,
                });

                await downloadFolder({ ROOT, files, archive });
            }
        }

        archive.finalize();
    } catch (e) {
        next(e);
    }
}
