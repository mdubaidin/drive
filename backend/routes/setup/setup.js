import { PutObjectCommand } from '@aws-sdk/client-s3';
import User from '../../schema/User.js';
import { isSetupCompleted } from '../../utils/functions.js';
import s3Client from '../../libs/s3Client.js';

const BUCKET = process.env.AWS_BUCKET_NAME;

async function setup(req, res, next) {
    try {
        const ROOT = req.user.storagePath;
        console.log(ROOT);
        const userId = req.user.id;
        const { purpose, occupation } = req.body;

        const user = new User({ _id: userId, purpose, occupation, setupCompleted: true });

        const params = {
            Bucket: BUCKET,
            Key: ROOT,
        };

        const command = new PutObjectCommand(params);
        await s3Client.send(command);

        await user.save();

        res.success({ message: 'Setup Completed Successfully', user });
    } catch (e) {
        next(e);
    }
}

async function checkSetup(req, res, next) {
    const userId = req.user.id;
    try {
        res.success({ setup: await isSetupCompleted(userId) });
    } catch (e) {
        next(e);
    }
}

export { setup, checkSetup };
