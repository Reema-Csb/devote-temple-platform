import {HttpErrors, post, requestBody, response} from '@loopback/rest';

const TEMPLE_SERVICE_URL =
  process.env.TEMPLE_SERVICE_URL ?? 'http://127.0.0.1:3001';

type BankDetailChangeRequest = {
  templeId: string;
  beneficiaryName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  accountType: string;
  panNumber: string;
  gstin?: string;
  superAdminEmail: string;
};

type UpdateTempleBankDetailRequest = {
  templeId: string;
  beneficiaryName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  accountType: string;
  panNumber: string;
  gstin?: string;
  payoutSchedule?: string;
};

export class TempleBankDetailController {
  @post('/temple-bank-details/request-change')
  @response(200, {
    description: 'Submit temple bank details change request',
  })
  async requestBankDetailChange(
    @requestBody({
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: [
              'templeId',
              'beneficiaryName',
              'accountNumber',
              'confirmAccountNumber',
              'ifscCode',
              'accountType',
              'panNumber',
              'superAdminEmail',
            ],
            properties: {
              templeId: {type: 'string'},
              beneficiaryName: {type: 'string'},
              accountNumber: {type: 'string'},
              confirmAccountNumber: {type: 'string'},
              ifscCode: {type: 'string'},
              accountType: {type: 'string'},
              panNumber: {type: 'string'},
              gstin: {type: 'string'},
              superAdminEmail: {
                type: 'string',
                format: 'email',
              },
            },
          },
        },
      },
    })
    request: BankDetailChangeRequest,
  ): Promise<object> {
    try {
      const templeServiceResponse = await fetch(
        `${TEMPLE_SERVICE_URL}/temple-bank-details/request-change`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        },
      );

      const responseText = await templeServiceResponse.text();

      let responseData: any = {};

      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = {
            message: responseText,
          };
        }
      }

      if (!templeServiceResponse.ok) {
        const message =
          responseData?.error?.message ??
          responseData?.message ??
          'Temple Service request failed';

        switch (templeServiceResponse.status) {
          case 400:
            throw new HttpErrors.BadRequest(message);

          case 404:
            throw new HttpErrors.NotFound(message);

          case 422:
            throw new HttpErrors.UnprocessableEntity(message);

          default:
            throw new HttpErrors.BadGateway(message);
        }
      }

      return responseData;
    } catch (error: unknown) {
      console.error('API GATEWAY BANK CHANGE REQUEST ERROR:', error);

      if (error instanceof HttpErrors.HttpError) {
        throw error;
      }

      throw new HttpErrors.BadGateway(
        error instanceof Error
          ? error.message
          : 'Unable to connect to Temple Service',
      );
    }
  }


@post('/temple-bank-details/update')
@response(200, {
  description: 'Update temple bank details',
})
async updateBankDetails(
  @requestBody({
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: [
            'templeId',
            'beneficiaryName',
            'accountNumber',
            'confirmAccountNumber',
            'ifscCode',
            'accountType',
            'panNumber',
          ],
          properties: {
            templeId: {type: 'string'},
            beneficiaryName: {type: 'string'},
            accountNumber: {type: 'string'},
            confirmAccountNumber: {type: 'string'},
            ifscCode: {type: 'string'},
            accountType: {type: 'string'},
            panNumber: {type: 'string'},
            gstin: {type: 'string'},
            payoutSchedule: {type: 'string'},
          },
        },
      },
    },
  })
  request: UpdateTempleBankDetailRequest,
): Promise<object> {
  try {
    const templeServiceResponse = await fetch(
      `${TEMPLE_SERVICE_URL}/temple-bank-details/update`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      },
    );

    const responseText = await templeServiceResponse.text();

    let responseData: any = {};

    if (responseText) {
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = {message: responseText};
      }
    }

    if (!templeServiceResponse.ok) {
      const message =
        responseData?.error?.message ??
        responseData?.message ??
        'Temple Service request failed';

      switch (templeServiceResponse.status) {
        case 400:
          throw new HttpErrors.BadRequest(message);
        case 404:
          throw new HttpErrors.NotFound(message);
        case 422:
          throw new HttpErrors.UnprocessableEntity(message);
        default:
          throw new HttpErrors.BadGateway(message);
      }
    }

    return responseData;
  } catch (error: unknown) {
    console.error('API GATEWAY BANK UPDATE ERROR:', error);

    if (error instanceof HttpErrors.HttpError) {
      throw error;
    }

    throw new HttpErrors.BadGateway(
      error instanceof Error
        ? error.message
        : 'Unable to connect to Temple Service',
    );
  }
}


}
