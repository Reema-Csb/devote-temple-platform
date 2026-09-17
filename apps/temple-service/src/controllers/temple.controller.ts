import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {Temple} from '../models';
import {
  TempleRepository,
  TempleOfferingRepository,
  OfferingCategoryMappingRepository,
  TempleImageRepository,
} from '../repositories';
import {inject} from '@loopback/core';
import {TempleHelperService} from '../services';

const basePath = '/temples';

export class TempleController {
  constructor(
    @repository(TempleRepository)
    public templeRepository: TempleRepository,

    @repository(TempleOfferingRepository)
    public templeOfferingRepository: TempleOfferingRepository,

    @repository(OfferingCategoryMappingRepository)
    public offeringCategoryMappingRepository: OfferingCategoryMappingRepository,

    @repository(TempleImageRepository)
    public templeImageRepository: TempleImageRepository,

    @inject('services.TempleHelperService')
    public templeHelperService: TempleHelperService,
  ) {}

  @post(basePath)
  @response(200, {
    description: 'Temple model instance',
    content: {'application/json': {schema: getModelSchemaRef(Temple)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Temple, {
            title: 'NewTemple',
            exclude: ['id'],
          }),
        },
      },
    })
    temple: any,
  ): Promise<Temple> {
    try {
      const createdTemple = await this.templeRepository.create({
        name: temple.name,
        description: temple.description,
        deity: temple.deity,
        isActive: temple.isActive ?? true,
      });

      if (temple.imageUrls && Array.isArray(temple.imageUrls)) {
        for (const imageUrl of temple.imageUrls) {
          await this.templeImageRepository.create({
            templeId: createdTemple.id,
            imageUrl,
          });
        }
      }

      if (temple.offerings && Array.isArray(temple.offerings)) {
        for (const offering of temple.offerings) {
          const createdOffering = await this.templeOfferingRepository.create({
            templeId: createdTemple.id,
            name: offering.name,
            description: offering.description,
            price: Number(offering.price),
            currency: offering.currency ?? 'INR',
            isActive: true,
            archana: true,
          });

          if (offering.categories && Array.isArray(offering.categories)) {
            for (const category of offering.categories) {
              await this.offeringCategoryMappingRepository.create({
                offeringId: createdOffering.id,
                templeId: createdTemple.id,
                categoryName: category,
              });
            }
          }
        }
      }

      return createdTemple;
    } catch (error) {
      console.error('CREATE TEMPLE ERROR:', {
        message: (error as any).message,
        name: (error as any).name,
        parent: (error as any).parent,
        original: (error as any).original,
        sql: (error as any).sql,
      });

      throw new HttpErrors.InternalServerError(
        JSON.stringify({
          message: (error as any).message,
          parent: (error as any).parent,
          original: (error as any).original,
          sql: (error as any).sql,
        }),
      );
    }
  }

  @get(`${basePath}/count`)
  @response(200, {
    description: 'Temple model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(Temple) where?: Where<Temple>): Promise<Count> {
    return this.templeRepository.count(where);
  }

  @get(basePath)
  @response(200, {
    description: 'Array of Temple model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Temple, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(Temple) filter?: Filter<Temple>): Promise<Temple[]> {
    try {
      return await this.templeRepository.find({
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
        limit: filter?.limit ?? 20,
        order: filter?.order,
        where: filter?.where,
      });
    } catch (error) {
      const sequelizeError = error as {
        name?: string;
        message?: string;
        sql?: string;
        parameters?: unknown;
        parent?: {
          message?: string;
          code?: string;
          detail?: string;
          hint?: string;
          sql?: string;
        };
        original?: {
          message?: string;
          code?: string;
          detail?: string;
          hint?: string;
          sql?: string;
        };
        stack?: string;
      };

      const debugDetails = {
        endpoint: 'GET /temples',
        filter,
        name: sequelizeError.name,
        message: sequelizeError.message,
        sql:
          sequelizeError.sql ??
          sequelizeError.parent?.sql ??
          sequelizeError.original?.sql,
        parameters: sequelizeError.parameters,
        parent: sequelizeError.parent,
        original: sequelizeError.original,
        stack: sequelizeError.stack,
      };

      console.error('TempleController.find failed', debugDetails);

      throw new HttpErrors.InternalServerError(
        JSON.stringify(debugDetails, null, 2),
      );
    }
  }

  @patch(basePath)
  @response(200, {
    description: 'Temple PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Temple, {partial: true}),
        },
      },
    })
    temple: Temple,
    @param.where(Temple) where?: Where<Temple>,
  ): Promise<Count> {
    return this.templeRepository.updateAll(temple, where);
  }
  @get(`${basePath}/explore`)
  @response(200, {
    description: 'Optimized temple explore list',
  })
  async findExplore(): Promise<any[]> {
    const temples: any[] = await this.templeRepository.find({
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
    });

    const templeIds = temples.map(temple => temple.id);

    const images = await this.templeImageRepository.find({
      where: {
        templeId: {
          inq: templeIds,
        },
      },
    });

    return temples.map(temple => {
      const templeImages = images.filter(image => image.templeId === temple.id);
      const imageUrls = templeImages.map(image => image.imageUrl);

      return {
        ...temple,
        imageUrl: imageUrls[0] ?? '',
        imageUrls,
      };
    });
  }

  @get(`${basePath}/{id}`)
  @response(200, {
    description: 'Temple model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Temple, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Temple, {exclude: 'where'})
    filter?: FilterExcludingWhere<Temple>,
  ): Promise<any> {
    const temple: any = await this.templeRepository.findById(id, {
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
    });

    if (temple.templeOfferings && Array.isArray(temple.templeOfferings)) {
      for (const offering of temple.templeOfferings) {
        const categoryMappings =
          await this.offeringCategoryMappingRepository.find({
            where: {
              offeringId: offering.id,
            },
          });

        offering.categories = categoryMappings.map(item => item.categoryName);
      }
    }

    const templeImages = await this.templeImageRepository.find({
      where: {templeId: temple.id},
    });
    const imageUrls = templeImages.map(image => image.imageUrl);

    temple.imageUrl = imageUrls[0] ?? '';
    temple.imageUrls = imageUrls;

    return temple;
  }

  @patch(`${basePath}/{id}`)
  @response(204, {
    description: 'Temple PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Temple, {partial: true}),
        },
      },
    })
    temple: any,
  ): Promise<void> {
    await this.templeRepository.updateById(id, {
      name: temple.name,
      description: temple.description,
      deity: temple.deity,
      isActive: temple.isActive,
    });

    if (Array.isArray(temple.imageUrls)) {
      await this.templeImageRepository.deleteAll({
        templeId: id,
      });

      for (const imageUrl of temple.imageUrls) {
        await this.templeImageRepository.create({
          templeId: id,
          imageUrl,
        });
      }
    }
  }

  @put(`${basePath}/{id}`)
  @response(204, {
    description: 'Temple PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() temple: Temple,
  ): Promise<void> {
    await this.templeRepository.replaceById(id, temple);
  }

  @del(`${basePath}/{id}`)
  @response(204, {
    description: 'Temple DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.templeHelperService.deleteTempleCompletely(id);
  }
}
