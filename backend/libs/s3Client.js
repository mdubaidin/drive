import { S3Client } from '@aws-sdk/client-s3';

const region = 'us-east-1';

const s3Client = new S3Client({ region });

export default s3Client;
