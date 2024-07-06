import { DeleteObjectCommand, DeleteObjectsCommand, ListObjectsCommand } from '@aws-sdk/client-s3';
import File from '../../schema/File.js';
import s3Client from '../../libs/s3Client.js';
import { getAWSKey } from '../../utils/functions.js';
import mongoose from 'mongoose';

const BUCKET = process.env.AWS_BUCKET_NAME;

export default async function (req, res, next) {
    let session = null;
    try {
        const fileId = req.params.fileId;
        const folderId = req.params.folderId;
        const ROOT = req.user.storagePath;
        const items = req.body.items;
        const userId = req.user.id;

        if (folderId) {
            session = await mongoose.startSession();
            session.startTransaction();

            const folder = await File.findOne({ _id: folderId, userId, file: false }, { key: 1 });

            if (!folder) Error.throw('No folder matched with the provided folder ID', 404);

            const Prefix = getAWSKey(ROOT, folder.key, folderId);

            const objectToDelete = await listContents(Prefix);

            if (objectToDelete) {
                const deleteParams = {
                    Bucket: BUCKET,
                    Delete: {
                        Objects: objectToDelete,
                        Quiet: false,
                    },
                };

                const deleteCommand = new DeleteObjectsCommand(deleteParams);

                await s3Client.send(deleteCommand);
            }

            await File.deleteMany({
                key: { $regex: new RegExp(`${folderId}((\/[a-f0-9])+)?`) },
                userId,
                trash: true,
            });

            await File.deleteOne({
                _id: folderId,
                userId,
                trash: true,
            });

            await session.commitTransaction();

            return res.success({ message: 'folder deleted sucessfully' });
        }

        if (fileId) {
            session = await mongoose.startSession();
            session.startTransaction();

            const file = await File.findOne({ _id: fileId, userId, file: true }, { key: 1 });

            if (!file) Error.throw('No file matched with the provided file ID', 404);

            const Key = getAWSKey(ROOT, file.key, fileId);

            const deleteParams = {
                Bucket: BUCKET,
                Key,
            };

            const command = new DeleteObjectCommand(deleteParams);

            await s3Client.send(command);

            await File.deleteOne({ _id: fileId, userId });

            await session.commitTransaction();

            return res.success({ message: 'file deleted sucessfully' });
        }

        // Selected Delete
        if (!items) Error.throw('Items are not found to delete');

        console.log({ items });

        session = await mongoose.startSession();
        session.startTransaction();

        const filesToDelete = items.files.map(({ _id, key }) => ({
            Key: getAWSKey(ROOT, key, _id),
        }));

        const foldersToDelete = [];

        // Listing objects of folders
        for (const folder of items.folders) {
            const { _id, key } = folder;
            const Prefix = getAWSKey(ROOT, key, _id);
            const folderContents = await listContents(Prefix);

            folderContents && foldersToDelete.push(...folderContents);
        }

        const objectToDelete = [...filesToDelete, ...foldersToDelete];

        if (objectToDelete.length) {
            const deleteParams = {
                Bucket: BUCKET,
                Delete: {
                    Objects: objectToDelete,
                    Quiet: false,
                },
            };

            const command = new DeleteObjectsCommand(deleteParams);

            await s3Client.send(command);
        }

        const folders = items.folders.map(folder => new RegExp(`${folder}((\/[a-f0-9])+)?`));
        const selectedFiles = [...items.folders, ...items.files].map(({ _id }) => _id);

        await File.deleteMany({
            key: { $in: folders },
            userId,
            trash: true,
        });

        const { acknowledged, deletedCount } = await File.deleteMany({
            _id: { $in: selectedFiles },
            userId,
            trash: true,
        });

        if (!acknowledged) {
            Error.throw('Something went wrong', 500);
        }

        await session.commitTransaction();

        deletedCount
            ? res.success('items deleted successfully')
            : res.error('failed to delete the items');
    } catch (e) {
        next(e);
        session?.abortTransaction();
    } finally {
        session?.endSession();
    }
}

async function listContents(Prefix) {
    const params = {
        Bucket: BUCKET,
        Prefix,
    };

    const listCommand = new ListObjectsCommand(params);

    const list = await s3Client.send(listCommand);

    if (!list.Contents) return;
    return list.Contents.map(({ Key }) => ({ Key }));
}
