import fs from 'fs';
import path from 'path';
import { Types } from 'mongoose';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import File from '../schema/File.js';
import s3Client from '../libs/s3Client.js';
import { getAWSKey, joinPaths, parseBytesToKB, sanitizeParent } from './functions.js';

const BUCKET = process.env.AWS_BUCKET_NAME;
const uploadsFolder = 'uploads';

async function uploadFile(args) {
    const { userId, parentKey, ROOT, file, available, session, sharedWith, access } = args;

    const { filename, originalname, mimetype, encoding, size } = file;
    const _id = new Types.ObjectId().toString();
    const AWSKey = joinPaths(ROOT, parentKey, _id);

    const fileMetadata = new File({
        _id,
        mimetype,
        size: parseBytesToKB(size),
        userId,
        key: sanitizeParent(parentKey),
        name: originalname,
        available,
        sharedWith,
        ...(access && { access }),
    });

    await fileMetadata.save({ session });

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
    return fileMetadata;
}

async function addSharedWith(parentId, userId) {
    if (!parentId) return { sharedWith: [], ownerId: userId };

    const [sharedPeople] = await File.aggregate([
        {
            $match: {
                _id: new Types.ObjectId(parentId),
                available: true,
                trash: false,
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
            $project: { sharedWith: 1, userId: 1, email: 1 },
        },
    ]);

    if (!sharedPeople) return { sharedWith: [], ownerId: userId };

    if (!sharedPeople.sharedWith.length) return { sharedWith: [], ownerId: userId };

    const sharedWith = sharedPeople.sharedWith;

    return { sharedWith, ownerId: sharedPeople.userId };
}

async function downloadFolder({ ROOT, files, archive }) {
    const subFolders = new Set();

    for (const file of files) {
        const folderIds = file.key.split('/');
        folderIds.forEach(folderId => subFolders.add(folderId));
    }

    const folderNames = await File.find({ _id: { $in: Array.from(subFolders) } }, { name: 1 });

    for (const file of files) {
        let filePath = file.key;
        const k = file.key.split('/');

        k.forEach(id => {
            const folder = folderNames.find(
                folderName => folderName._id.toString() === id.toString()
            );
            const folderId = folder._id.toString();
            filePath = filePath.replace(folderId, folder.name);
        });

        const params = {
            Bucket: BUCKET,
            Key: getAWSKey(ROOT, file.key, file._id.toString()),
        };

        const command = new GetObjectCommand(params);

        const response = await s3Client.send(command);
        const stream = response.Body;

        archive.append(stream, { name: `/${filePath}/${file.name}` });
    }
}

export { addSharedWith, downloadFolder, uploadFile };
