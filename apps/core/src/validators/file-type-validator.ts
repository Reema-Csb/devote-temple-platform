import {inject, injectable} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {fromStream} from 'file-type';
import {
  File,
  FileUtilBindings,
  IFileValidator,
  MulterConfig,
  ValidatorOutput,
} from '@sourceloop/file-utils';
import {PassThrough} from 'stream';

@injectable()
export class FileTypeValidator implements IFileValidator {
  constructor(
    @inject(FileUtilBindings.TEXT_FILE_TYPES)
    private readonly textFileTypes: string[],
    @inject(FileUtilBindings.MulterConfig, {optional: true})
    private readonly uploadOptionsGetter: MulterConfig,
  ) {}

  async validate(file: File): Promise<ValidatorOutput> {
    const ext = `.${file.originalname.split('.').pop() ?? ''}`;

    if (this.textFileTypes.includes(ext)) {
      await this._validateTextFile(file, ext);
      return {file};
    } else {
      const updatedFile = await this._validateBinaryFile(file, ext);
      return {file: updatedFile};
    }
  }

  private async _validateTextFile(file: File, extension: string) {
    const validExtensions = this.uploadOptionsGetter.configFor(
      'extensions',
      file,
    );
    if (validExtensions) {
      if (!extension || !validExtensions.includes(extension)) {
        throw new HttpErrors.BadRequest(`${extension} file type not allowed`);
      }
    }
  }

  private async _validateBinaryFile(file: File, extension: string) {
    const validExtensions = this.uploadOptionsGetter.configFor(
      'extensions',
      file,
    );

    const saveStream = new PassThrough();
    file.stream.pipe(saveStream);
    try {
      const trueType = await fromStream(file.stream);
      let ext: string | undefined = trueType?.ext;
      if (ext && !ext.startsWith('.')) {
        ext = `.${ext}`;
      }

      if (validExtensions) {
        if (!ext || !validExtensions.includes(ext) || !file.mimetype) {
          throw new HttpErrors.BadRequest(`${ext} file type not allowed`);
        }
      }
      return {
        ...file,
        stream: saveStream,
      };
    } catch (error) {
      saveStream.destroy();
      throw error;
    }
  }
}
