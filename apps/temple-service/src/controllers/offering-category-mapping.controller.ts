import {repository} from '@loopback/repository';

import {post, requestBody} from '@loopback/rest';

import {OfferingCategoryMapping} from '../models';

import {
  OfferingCategoryMappingRepository,
} from '../repositories';

export class OfferingCategoryMappingController {

  constructor(
    @repository(OfferingCategoryMappingRepository)
    public offeringCategoryMappingRepository:
      OfferingCategoryMappingRepository,
  ) {}

  @post('/offering-category-mappings')
  async create(
    @requestBody()
    mapping: OfferingCategoryMapping,
  ): Promise<OfferingCategoryMapping> {

    return this.offeringCategoryMappingRepository.create(
      mapping,
    );
  }
}