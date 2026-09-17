import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  TempleLocation,
  Temple,
} from '../models';
import {TempleLocationRepository} from '../repositories';

export class TempleLocationTempleController {
  constructor(
    @repository(TempleLocationRepository)
    public templeLocationRepository: TempleLocationRepository,
  ) { }

  @get('/temple-locations/{id}/temple', {
    responses: {
      '200': {
        description: 'Temple belonging to TempleLocation',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Temple),
          },
        },
      },
    },
  })
  async getTemple(
    @param.path.string('id') id: typeof TempleLocation.prototype.id,
  ): Promise<Temple> {
    return this.templeLocationRepository.temple(id);
  }
}
