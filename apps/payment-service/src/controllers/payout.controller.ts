import {service} from '@loopback/core';
import {repository, Filter} from '@loopback/repository';
import {get, param, post, requestBody, response} from '@loopback/rest';

import {Payout} from '../models';
import {PayoutRepository} from '../repositories';
import {PayoutService} from '../services/payout.service';

const basePath = '/payouts';

export class PayoutController {
  constructor(
    @repository(PayoutRepository)
    public payoutRepository: PayoutRepository,

    @service(PayoutService)
    private payoutService: PayoutService,
  ) {}

  @get(basePath)
  async find(@param.filter(Payout) filter?: Filter<Payout>) {
    return this.payoutRepository.find(filter);
  }

  @get(`${basePath}/pending/{templeId}`)
  async getPendingPayout(@param.path.string('templeId') templeId: string) {
    return this.payoutService.calculateTemplePayout(templeId);
  }

  @post(`${basePath}/mark-paid`)
  @response(200, {
    description: 'Mark temple payout as paid manually',
  })
  async markPaid(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['templeId'],
            properties: {
              templeId: {type: 'string'},
              remarks: {type: 'string'},
            },
          },
        },
      },
    })
    body: {
      templeId: string;
      remarks?: string;
    },
  ) {
    return this.payoutService.markTemplePayoutPaid(
      body.templeId,
      body.remarks,
    );
  }
}