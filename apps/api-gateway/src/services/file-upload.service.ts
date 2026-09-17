import {injectable} from '@loopback/core';
import {GetObjectCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {randomUUID} from 'crypto';
import path from 'path';

@injectable()
export class FileUploadService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor() {
    const region = process.env.AWS_REGION;
    const bucket = process.env.AWS_BUCKET_NAME;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!region) {
      throw new Error('AWS_REGION is missing from api-gateway/.env');
    }

    if (!bucket) {
      throw new Error('AWS_BUCKET_NAME is missing from api-gateway/.env');
    }

    if (!accessKeyId) {
      throw new Error('AWS_ACCESS_KEY_ID is missing from api-gateway/.env');
    }

    if (!secretAccessKey) {
      throw new Error('AWS_SECRET_ACCESS_KEY is missing from api-gateway/.env');
    }

    this.bucket = bucket;

    this.s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'temples',
  ): Promise<{key: string}> {
    if (!file) {
      throw new Error('No image file was provided');
    }

    const safeFolder = folder.replace(/^\/+|\/+$/g, '');

    const extension = path.extname(file.originalname).toLowerCase() || '.jpg';

    const key = `${safeFolder}/${randomUUID()}${extension}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    console.log('Uploaded successfully:', {
      bucket: this.bucket,
      region: process.env.AWS_REGION,
      key,
    });

    return {key};
  }

  async getPresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, {
      expiresIn: 3600,
    });
  }
}
