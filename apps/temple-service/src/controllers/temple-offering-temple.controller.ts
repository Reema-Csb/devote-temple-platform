import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  TempleOffering,
  Temple,
} from '../models';
import {TempleOfferingRepository} from '../repositories';

export class TempleOfferingTempleController {
  constructor(
    @repository(TempleOfferingRepository)
    public templeOfferingRepository: TempleOfferingRepository,
  ) { }

  @get('/temple-offerings/{id}/temple', {
    responses: {
      '200': {
        description: 'Temple belonging to TempleOffering',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Temple),
          },
        },
      },
    },
  })
  async getTemple(
    @param.path.string('id') id: typeof TempleOffering.prototype.id,
  ): Promise<Temple> {
    return this.templeOfferingRepository.temple(id);
  }
}
