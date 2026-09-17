import {
  Application,
  injectable,
  Component,
  config,
  ContextTags,
  CoreBindings,
  inject,
  ProviderMap,
} from '@loopback/core';
import {CoreComponentBindings} from './keys';
import {DEFAULT_CORE_OPTIONS, CoreComponentOptions} from './types';
import {AWSS3Bindings} from 'loopback4-s3';
import {
  AwsS3Provider,
  MulterConfigProvider,
  MulterStorageProvider,
} from './providers';
import {FileUtilBindings} from '@sourceloop/file-utils';
import {
  FileAdapterService,
  FileMetadataProvider,
  FileValidatorService,
  FileUploadLimitsService,
  S3HelperService,
} from './services';
import {FileNameValidator, FileTypeValidator} from './validators';

// Configure the binding for CoreComponent
@injectable({tags: {[ContextTags.KEY]: CoreComponentBindings.COMPONENT}})
export class CoreComponent implements Component {
  providers?: ProviderMap;
  services?: Component['services'];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: Application,
    @config()
    private options: CoreComponentOptions = DEFAULT_CORE_OPTIONS,
  ) {
    this.providers = {
      [AWSS3Bindings.AwsS3Provider.key]: AwsS3Provider,
      [FileUtilBindings.MulterConfig.key]: MulterConfigProvider,
      [FileUtilBindings.MulterStorage.key]: MulterStorageProvider,
      [FileUtilBindings.FILE_REQUEST_METADATA.key]: FileMetadataProvider,
    };
    this.services = [
      S3HelperService,
      FileAdapterService,
      FileValidatorService,
      FileUploadLimitsService,
      FileNameValidator,
      FileTypeValidator,
    ];
  }
}
