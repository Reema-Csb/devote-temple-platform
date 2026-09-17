import {extensionPoint, inject, service} from '@loopback/core';
import {
  FileUtilBindings,
  FileValidatorExtensionPoint,
  IFileRequestMetadata,
  ParsedMultipartData,
  ValidationResult,
} from '@sourceloop/file-utils';
import {getConfigProperty} from '../utils';
import {FileNameValidator, FileTypeValidator} from '../validators';

@extensionPoint(FileValidatorExtensionPoint.key)
export class FileValidatorService {
  constructor(
    @service(FileNameValidator)
    private readonly fileNameValidator: FileNameValidator,
    @service(FileTypeValidator)
    private readonly fileTypeValidator: FileTypeValidator,
    @inject(FileUtilBindings.FILE_REQUEST_METADATA)
    private readonly metadata: IFileRequestMetadata,
  ) {}

  async validateParsedData(
    parsed: ParsedMultipartData,
  ): Promise<ValidationResult | undefined> {
    const {file} = parsed;
    if (!file) {
      return undefined;
    }
    const validatorMapping: Record<
      string,
      FileNameValidator | FileTypeValidator
    > = {
      FileNameValidator: this.fileNameValidator,
      FileTypeValidator: this.fileTypeValidator,
    };
    const applicable = getConfigProperty(this.metadata, 'validators', file);
    let currentFile = file;
    const filteredValidators: (FileNameValidator | FileTypeValidator)[] = [];
    if (applicable) {
      applicable.forEach(validator => {
        if (validatorMapping[validator.name]) {
          filteredValidators.push(validatorMapping[validator.name]);
        }
      });
    }
    const waiters: Promise<string | null>[] = [];
    for (const validator of filteredValidators) {
      const result = await validator.validate(currentFile);
      currentFile = result.file;
      if (result.waiter) waiters.push(result.waiter);
    }
    return {file: currentFile, waiters};
  }
}
