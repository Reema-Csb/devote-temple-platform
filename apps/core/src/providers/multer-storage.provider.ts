import {Context, Provider, inject} from '@loopback/core';
import multer from 'multer';
import {Request} from '@loopback/rest';
import {
  FileUtilBindings,
  FileValidatorService,
  IFileRequestMetadata,
} from '@sourceloop/file-utils';
import {getConfigProperty} from '../utils';

export class MulterStorageProvider implements Provider<multer.StorageEngine> {
  constructor(
    @inject.context()
    private readonly context: Context,
    @inject(FileUtilBindings.FILE_REQUEST_METADATA, {optional: true})
    private readonly config: IFileRequestMetadata,
    @inject('services.FileValidatorService')
    private readonly validator: FileValidatorService,
  ) {}

  async value() {
    return {
      _handleFile: async (
        req: Request,
        file: Express.Multer.File,
        cb: (error?: Error, info?: Partial<Express.Multer.File>) => void,
      ) => {
        const storage = await this._getStorage(file);
        this.validator
          .validateParsedData({
            file,
            body: req.body,
          })
          .then(result => {
            if (result) storage._handleFile(req, result.file, cb);
          })
          .catch(err => cb(err));
      },
      _removeFile: async (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null) => void,
      ) => {
        const storage = await this._getStorage(file);
        storage._removeFile(req, file, cb);
      },
    };
  }

  private _getStorage(file: Express.Multer.File) {
    const config = getConfigProperty(this.config, 'storageOptions', file);
    return this.context.get<multer.StorageEngine>(
      `services.${config?.storageClass.name ?? 'MulterMemoryStorage'}`,
    );
  }
}
