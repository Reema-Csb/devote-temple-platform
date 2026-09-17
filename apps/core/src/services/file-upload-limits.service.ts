import {IFileLimitsGetter, MulterUploadOptions} from '@sourceloop/file-utils';
import {injectable, BindingScope} from '@loopback/context';
import {AnyObject} from '@loopback/repository';
import {MAX_FILES, UPLOAD_FILE_SIZE} from '../constants';
import {UserRole} from '../enums';

@injectable({scope: BindingScope.SINGLETON})
export class FileUploadLimitsService implements IFileLimitsGetter {
  constructor() {
    console.log(
      '[FileUploadLimitsService] Loaded with UserRole enum:',
      UserRole,
    );
  }

  async get(): Promise<MulterUploadOptions<AnyObject>> {
    const sizeLimits = {
      fileSize: UPLOAD_FILE_SIZE,
      files: MAX_FILES,
    };
    return {sizeLimits};
  }
}
