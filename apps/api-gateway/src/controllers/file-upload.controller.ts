import {inject, service} from '@loopback/core';
import {
  post,
  get,
  param,
  Request,
  RestBindings,
  response,
  requestBody,
} from '@loopback/rest';
import multer from 'multer';
import {FileUploadService} from '../services/file-upload.service';

const upload = multer({storage: multer.memoryStorage()});

export class FileUploadController {
  constructor(
    @service(FileUploadService)
    private fileUploadService: FileUploadService,
  ) {}

  @post('/upload')
  @response(200, {
    description: 'Upload temple images to S3 and return keys',
  })
  async uploadImages(
    @requestBody({
      description: 'Upload one or more temple images',
      required: true,
      content: {
        'multipart/form-data': {
          'x-parser': 'stream',
          schema: {
            type: 'object',
            properties: {
              files: {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
          },
        },
      },
    })
    @inject(RestBindings.Http.REQUEST)
    request: Request,
  ): Promise<{keys: string[]}> {
    return new Promise((resolve, reject) => {
      upload.array('files')(request as any, {} as any, error => {
        if (error) return reject(error);

        const files = (request as any).files as Express.Multer.File[];

        if (!files?.length) {
          return resolve({keys: []});
        }

        const folder = ((request as any).body?.folder ?? 'temples') as string;

        Promise.all(
          files.map(file => this.fileUploadService.uploadFile(file, folder)),
        )
          .then(uploaded => resolve({keys: uploaded.map(item => item.key)}))
          .catch(reject);
      });
    });
  }
  @get('/upload/presigned-url')
  @response(200, {
    description: 'Get presigned image URL from S3 key',
  })
  async getPresignedUrl(
    @param.query.string('key') key: string,
  ): Promise<{url: string}> {
    const url = await this.fileUploadService.getPresignedUrl(key);

    return {url};
  }
}
