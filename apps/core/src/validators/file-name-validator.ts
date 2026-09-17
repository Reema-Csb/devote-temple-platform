import {injectable} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {File, IFileValidator, NAME_REGEX, ValidatorOutput} from '@sourceloop/file-utils';
import path from 'path';

@injectable()
export class FileNameValidator implements IFileValidator {
  constructor() {}

  async validate(file: File): Promise<ValidatorOutput> {
    await this._validateFileName(file);
    return {file};
  }

  private async _validateFileName(file: File) {
    const baseName = path.basename(
      file.originalname,
      path.extname(file.originalname),
    );
    if (NAME_REGEX.test(baseName)) {
      throw new HttpErrors.BadRequest(
        'File name should not contain special characters',
      );
    }
    return file;
  }
}
