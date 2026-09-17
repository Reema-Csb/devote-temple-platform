import { injectable, inject } from '@loopback/core';
import { AWSS3Bindings, S3WithSigner } from 'loopback4-s3';

@injectable()
export class S3HelperService {
  constructor(
    @inject(AWSS3Bindings.AwsS3Provider)
    private readonly s3: S3WithSigner,
  ) { }

  async getSignedUrl(command: GetObjectCommand): Promise<string> {
    return getSignedUrl(this.s3 as any, command, { expiresIn: 3600 });
  }
}
