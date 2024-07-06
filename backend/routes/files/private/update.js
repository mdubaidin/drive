import { deleteObject } from '../../../utils/awsFunctions.js';
import { getAWSKey, joinPaths } from '../../../utils/functions.js';
import File from '../../../schema/File.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import s3Client from '../../../libs/s3Client.js';

const BUCKET = process.env.AWS_BUCKET_NAME;
const uploadsFolder = 'uploads';

export default async function (req, res, next) {
    try {
        const fileId = req.params.id;
        const fileToUpload = req.files.files[0];
        const platform = req.body.platform;
        const userId = req.user.id;
        const parentKey = '';
        const ROOT = req.user.storagePath;

        if (!fileId) Error.throw('file Id must be provided');

        const file = await File.findOne({ _id: fileId, userId, file: true });

        if (!file) Error.throw('Unable to find the file to update', 404);

        const Key = getAWSKey(ROOT, file.key, fileId);

        await deleteObject(Key);

        if (!fileToUpload) Error.throw('file not found to upload', 404);

        const { filename, mimetype, encoding, size } = fileToUpload;
        const _id = fileId;
        const AWSKey = joinPaths(ROOT, parentKey, _id);

        const filePath = path.join(uploadsFolder, filename);

        if (!fs.existsSync(filePath)) Error.throw('File not found', 404);

        const fileContent = fs.createReadStream(filePath);

        const params = {
            Bucket: BUCKET,
            Key: AWSKey,
            Body: fileContent,
            ContentType: mimetype,
            ContentEncoding: encoding,
            Size: size,
        };

        const command = new PutObjectCommand(params);

        await s3Client.send(command);

        console.log('File uploaded to S3:', filename);

        // Delete the file after successful upload
        fs.unlinkSync(filePath);
        console.log('File deleted:', filePath);

        file.mimetype = mimetype;
        file.size = size;
        file.key = parentKey;
        file.platform = { slug: platform };

        file.getTextLogo(platform);
        file.getLogo(platform);

        await file.save();

        console.log(file);

        res.success('file updated successfully');
    } catch (e) {
        next(e);
    }
}
