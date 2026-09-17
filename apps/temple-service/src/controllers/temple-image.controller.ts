import {repository} from '@loopback/repository';
import {del, get, param, post, requestBody} from '@loopback/rest';

import {TempleImage} from '../models';
import {TempleImageRepository} from '../repositories';

export class TempleImageController {
  constructor(
    @repository(TempleImageRepository)
    public templeImageRepository: TempleImageRepository,
  ) {}

  @post('/temple-images')
  async create(
    @requestBody()
    templeImage: TempleImage,
  ): Promise<TempleImage> {
    return this.templeImageRepository.create(templeImage);
  }

  @get('/temple-images')
  async find(
    @param.filter(TempleImage) filter?: object,
  ): Promise<TempleImage[]> {
    return this.templeImageRepository.find(filter);
  }

  @del('/temple-images/{id}')
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.templeImageRepository.deleteById(id);
  }
}
