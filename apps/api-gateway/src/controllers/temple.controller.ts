import {service} from '@loopback/core';
import {Count, CountSchema, Filter, Where} from '@loopback/repository';
import {
  del,
  get,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {ModifiedRestService, restService} from '@sourceloop/core';
import {Temple} from '../models';
import {FileUploadService} from '../services/file-upload.service';

const basePath = '/temples';
const TEMPLE_SERVICE_URL =
  process.env.TEMPLE_SERVICE_URL ?? 'http://127.0.0.1:3001';

export class TempleController {
  constructor(
    @restService(Temple)
    private templeService: ModifiedRestService<Temple>,

    @service(FileUploadService)
    private fileUploadService: FileUploadService,
  ) {}

  // ------------------------------------------------------------------
  // Optimized Explore API
  // ------------------------------------------------------------------

  @get(`${basePath}/explore`)
  @response(200, {
    description: 'Optimized temple explore list',
  })
  async findExplore(): Promise<any[]> {
    const temples: any[] = await this.templeService.find({
      where: {
        deleted: false,
      },
      include: [
        {relation: 'templeLocation'},
        {
          relation: 'templeOfferings',
          scope: {
            where: {
              deleted: false,
            },
          },
        },
      ],
      order: ['createdOn DESC'],
    } as any);

    const templeIds = temples.map(temple => temple.id);

    const imageFilter = encodeURIComponent(
      JSON.stringify({
        where: {
          templeId: {
            inq: templeIds,
          },
        },
      }),
    );

    const imageResponse = await fetch(
      `${TEMPLE_SERVICE_URL}/temple-images?filter=${imageFilter}`,
    );

    const images = imageResponse.ok ? await imageResponse.json() : [];

    return Promise.all(
      temples.map(async temple => {
        const templeImages = images.filter(
          (image: any) => image.templeId === temple.id,
        );

        const imageKeys = templeImages.map((image: any) => image.imageUrl);

        const signedImageUrls = await Promise.all(
          imageKeys.map((imageKey: string) =>
            this.fileUploadService.getPresignedUrl(imageKey),
          ),
        );

        return {
          ...temple,
          imageUrl: signedImageUrls[0] ?? '',
          imageUrls: signedImageUrls,
        };
      }),
    );
  }

  // ------------------------------------------------------------------
  // Create Temple
  // ------------------------------------------------------------------

  @post(basePath)
  @response(200, {
    description: 'Create temple',
  })
  async create(@requestBody() temple: Temple): Promise<Temple> {
    return this.templeService.create(temple);
  }

  // ------------------------------------------------------------------
  // Count
  // ------------------------------------------------------------------

  @get(`${basePath}/count`)
  @response(200, {
    description: 'Temple count',
    content: {
      'application/json': {
        schema: CountSchema,
      },
    },
  })
  async count(@param.where(Temple) where?: Where<Temple>): Promise<Count> {
    return this.templeService.count(where);
  }

  // ------------------------------------------------------------------
  // Find All
  // ------------------------------------------------------------------

  @get(basePath)
  @response(200, {
    description: 'Find temples',
  })
  async find(@param.filter(Temple) filter?: Filter<Temple>): Promise<Temple[]> {
    return this.templeService.find(filter);
  }

  // ------------------------------------------------------------------
  // Optimized Find By Id
  // ------------------------------------------------------------------

  @get(`${basePath}/{id}`)
  @response(200, {
    description: 'Temple details',
  })
  async findById(@param.path.string('id') id: string): Promise<any> {
    const temple: any = await this.templeService.findById(id, {
      include: [
        {
          relation: 'templeLocation',
        },
        {
          relation: 'templeOfferings',
          scope: {
            where: {
              deleted: false,
            },
          },
        },
      ],
    } as any);

    const imageFilter = encodeURIComponent(
      JSON.stringify({
        where: {
          templeId: id,
        },
      }),
    );

    const imageResponse = await fetch(
      `${TEMPLE_SERVICE_URL}/temple-images?filter=${imageFilter}`,
    );

    const images = imageResponse.ok ? await imageResponse.json() : [];

    const imageKeys = images.map((image: any) => image.imageUrl);

    const signedImageUrls = await Promise.all(
      imageKeys.map((imageKey: string) =>
        this.fileUploadService.getPresignedUrl(imageKey),
      ),
    );

    return {
      ...temple,
      imageUrl: signedImageUrls[0] ?? '',
      imageUrls: signedImageUrls,
    };
  }

  // ------------------------------------------------------------------
  // Update All
  // ------------------------------------------------------------------

  @patch(basePath)
  @response(200, {
    description: 'Update all temples',
  })
  async updateAll(
    @requestBody() temple: Partial<Temple>,
    @param.where(Temple) where?: Where<Temple>,
  ): Promise<Count> {
    return this.templeService.update(temple, where);
  }

  // ------------------------------------------------------------------
  // Update By Id
  // ------------------------------------------------------------------

  @patch(`${basePath}/{id}`)
  @response(204, {
    description: 'Update temple',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() temple: Partial<Temple>,
  ): Promise<void> {
    return this.templeService.updateById(id, temple);
  }

  // ------------------------------------------------------------------
  // Replace
  // ------------------------------------------------------------------

  @put(`${basePath}/{id}`)
  @response(204, {
    description: 'Replace temple',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() temple: Temple,
  ): Promise<void> {
    return this.templeService.replaceById(id, temple);
  }

  // ------------------------------------------------------------------
  // Delete
  // ------------------------------------------------------------------

  @del(`${basePath}/{id}`)
  @response(204, {
    description: 'Delete temple',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    return this.templeService.deleteById(id);
  }
}
