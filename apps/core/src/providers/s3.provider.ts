import {Provider, inject} from '@loopback/core';
import {S3WithSigner, AWSS3Bindings, AwsS3Config} from 'loopback4-s3';

export class AwsS3Provider implements Provider<S3WithSigner> {
  constructor(
    @inject(AWSS3Bindings.Config, {optional: true})
    private readonly config?: AwsS3Config,
  ) {}

  value(): S3WithSigner {
    return new S3WithSigner({
      ...this.config,
    });
  }
}
