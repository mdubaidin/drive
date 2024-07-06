import { CopyObjectCommand, DeleteObjectCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import s3Client from '../libs/s3Client.js';

const BUCKET = process.env.AWS_BUCKET_NAME;

async function listObjects(Prefix) {
    const params = {
        Bucket: BUCKET,
        Prefix,
    };

    const listCommand = new ListObjectsCommand(params);

    const list = await s3Client.send(listCommand);

    if (!list.Contents) return;
    return list.Contents.map(({ Key }) => ({ Key }));
}

async function copyObject(source, destination) {
    const copyParams = {
        Bucket: BUCKET,
        CopySource: BUCKET + '/' + source,
        Key: destination,
    };

    const copyCommand = new CopyObjectCommand(copyParams);
    await s3Client.send(copyCommand);
}

async function deleteObject(source) {
    const deleteParams = {
        Bucket: BUCKET,
        Key: source,
    };

    const deleteCommand = new DeleteObjectCommand(deleteParams);
    await s3Client.send(deleteCommand);
}

export { listObjects, copyObject, deleteObject };
