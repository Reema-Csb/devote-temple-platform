import {injectable, inject, service} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {AWSS3Bindings, S3WithSigner} from 'loopback4-s3';
import {GetObjectCommand} from '@aws-sdk/client-s3';
import {S3HelperService} from './s3-helper.service';
import {FileMetadata, StorageSource} from '../types';

@injectable()
export class FileAdapterService {
  constructor(
    @inject(AWSS3Bindings.AwsS3Provider)
    private readonly s3: S3WithSigner,
    @service(S3HelperService)
    private readonly signedUrlService: S3HelperService,
  ) {}

  async generateFileInfoWithSignedUrl(fileKey: string) {
    if (!fileKey) {
      throw new HttpErrors.BadRequest();
    }

    try {
      const metadata = await this.s3.headObject({
        Bucket: process.env.AWS_S3_BUCKET ?? '',
        Key: fileKey,
      });

      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET ?? '',
        Key: fileKey,
      });

      const downloadUrl = await this.signedUrlService.getSignedUrl(command);

      return {
        metadata: metadata.Metadata,
        contentType: metadata.ContentType,
        size: metadata.ContentLength,
        lastModified: metadata.LastModified,
        downloadUrl,
      };
    } catch (error) {
      throw new HttpErrors.NotFound();
    }
  }

  generateFileResponse(
    files: FileMetadata[] | FileMetadata,
  ): {fileKey: string; originalName: string; source: StorageSource}[] {
    if (Array.isArray(files)) {
      return files.reduce(
        (
          acc: {fileKey: string; originalName: string; source: StorageSource}[],
          val,
        ) => {
          acc.push({
            fileKey: val.key,
            originalName: val.originalname,
            source: StorageSource.S3,
          });
          return acc;
        },
        [],
      );
    } else {
      return [
        {
          fileKey: files.key,
          originalName: files.originalname,
          source: StorageSource.S3,
        },
      ];
    }
  }

  async getPresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET ?? '',
      Key: key,
    });
    return this.signedUrlService.getSignedUrl(command);
  }
}
