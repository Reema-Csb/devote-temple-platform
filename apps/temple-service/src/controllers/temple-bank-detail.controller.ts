import {repository} from '@loopback/repository';
import {get, HttpErrors, param, post, requestBody} from '@loopback/rest';
import axios from 'axios';

import {TempleBankDetail} from '../models';
import {TempleBankDetailRepository} from '../repositories';
import {sendBankDetailChangeRequestEmail} from '../services';

const RAZORPAY_BASE_URL =
  process.env.RAZORPAY_BASE_URL ?? 'https://api.razorpay.com/v1';

type TempleBankDetailRequest = {
  templeId: string;
  beneficiaryName: string;
  accountNumber: string;
  ifscCode: string;
  accountType?: string;
  panNumber?: string;
  gstin?: string;
  payoutSchedule?: string;
  email?: string;
  contact?: string;
};

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
  constructor(
    @repository(TempleBankDetailRepository)
    public templeBankDetailRepository: TempleBankDetailRepository,
  ) {}

  @post('/temple-bank-details/request-change')
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
              templeId: {
                type: 'string',
              },
              beneficiaryName: {
                type: 'string',
              },
              accountNumber: {
                type: 'string',
              },
              confirmAccountNumber: {
                type: 'string',
              },
              ifscCode: {
                type: 'string',
              },
              accountType: {
                type: 'string',
              },
              panNumber: {
                type: 'string',
              },
              gstin: {
                type: 'string',
              },
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
    const {
      templeId,
      beneficiaryName,
      accountNumber,
      confirmAccountNumber,
      ifscCode,
      accountType,
      panNumber,
      gstin,
      superAdminEmail,
    } = request;

    if (
      !templeId?.trim() ||
      !beneficiaryName?.trim() ||
      !accountNumber?.trim() ||
      !confirmAccountNumber?.trim() ||
      !ifscCode?.trim() ||
      !accountType?.trim() ||
      !panNumber?.trim() ||
      !superAdminEmail?.trim()
    ) {
      throw new HttpErrors.BadRequest(
        'Please provide all required bank details',
      );
    }

    if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      throw new HttpErrors.BadRequest(
        'Account number and re-entered account number do not match',
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(superAdminEmail.trim())) {
      throw new HttpErrors.BadRequest(
        'Please provide a valid super admin email address',
      );
    }

    const allowedAccountTypes = ['savings', 'current'];

    if (!allowedAccountTypes.includes(accountType.trim().toLowerCase())) {
      throw new HttpErrors.BadRequest(
        'Account type must be Savings or Current',
      );
    }

    const existingBankDetail = await this.templeBankDetailRepository.findOne({
      where: {
        templeId: templeId.trim(),
      },
    });

    if (!existingBankDetail?.id) {
      throw new HttpErrors.NotFound(
        'Bank details were not found for this temple',
      );
    }

    try {
      const configuredSuperAdminEmail =
        process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();

      const recipientEmail =
        configuredSuperAdminEmail || superAdminEmail.trim().toLowerCase();

      await sendBankDetailChangeRequestEmail(recipientEmail, {
        templeId: templeId.trim(),
        beneficiaryName: beneficiaryName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        accountType: accountType.trim(),
        panNumber: panNumber.trim().toUpperCase(),
        gstin: gstin?.trim().toUpperCase() || '',
        requestedOn: new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
        }),
      });

      await this.templeBankDetailRepository.updateById(existingBankDetail.id, {
        status: 'requested',
      });

      const updatedBankDetail = await this.templeBankDetailRepository.findById(
        existingBankDetail.id,
      );

      return {
        success: true,
        message: 'Bank details change request sent successfully',
        bankDetail: {
          id: updatedBankDetail.id,
          templeId: updatedBankDetail.templeId,
          razorpayContactId: updatedBankDetail.razorpayContactId,
          razorpayFundAccountId: updatedBankDetail.razorpayFundAccountId,
          verificationStatus: updatedBankDetail.verificationStatus,
          status: updatedBankDetail.status,
        },
        notificationEmail: recipientEmail,
      };
    } catch (error: any) {
      console.error('BANK CHANGE REQUEST ERROR:', error);

      if (error instanceof HttpErrors.HttpError) {
        throw error;
      }

      throw new HttpErrors.BadRequest(
        error?.message ?? 'Unable to submit bank details change request',
      );
    }
  }

  @post('/temple-bank-details')
  async create(
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
              'ifscCode',
            ],
            properties: {
              templeId: {type: 'string'},
              beneficiaryName: {type: 'string'},
              accountNumber: {type: 'string'},
              ifscCode: {type: 'string'},
              accountType: {type: 'string'},
              panNumber: {type: 'string'},
              gstin: {type: 'string'},
              payoutSchedule: {type: 'string'},
              email: {
                type: 'string',
                format: 'email',
              },
              contact: {type: 'string'},
            },
          },
        },
      },
    })
    bankDetail: TempleBankDetailRequest,
  ): Promise<TempleBankDetail> {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new HttpErrors.UnprocessableEntity('Razorpay keys are missing');
    }

    const existingBankDetail = await this.templeBankDetailRepository.findOne({
      where: {
        templeId: bankDetail.templeId,
      },
    });

    if (existingBankDetail) {
      throw new HttpErrors.BadRequest(
        'Bank details already exist for this temple',
      );
    }

    try {
      const auth = {
        username: keyId,
        password: keySecret,
      };

      const contactResponse = await axios.post(
        `${RAZORPAY_BASE_URL}/contacts`,
        {
          name: bankDetail.beneficiaryName.trim(),
          email: bankDetail.email ?? 'temple@example.com',
          contact: bankDetail.contact ?? '9876543210',
          type: 'vendor',
          reference_id: bankDetail.templeId,
          notes: {
            templeId: bankDetail.templeId,
          },
        },
        {auth},
      );

      const razorpayContactId = contactResponse.data?.id;

      if (!razorpayContactId) {
        throw new HttpErrors.BadRequest('Razorpay did not return a contact ID');
      }

      const fundAccountResponse = await axios.post(
        `${RAZORPAY_BASE_URL}/fund_accounts`,
        {
          contact_id: razorpayContactId,
          account_type: 'bank_account',
          bank_account: {
            name: bankDetail.beneficiaryName.trim(),
            ifsc: bankDetail.ifscCode.trim().toUpperCase(),
            account_number: bankDetail.accountNumber.trim(),
          },
        },
        {auth},
      );

      const razorpayFundAccountId = fundAccountResponse.data?.id;

      if (!razorpayFundAccountId) {
        throw new HttpErrors.BadRequest(
          'Razorpay did not return a fund account ID',
        );
      }

      return await this.templeBankDetailRepository.create({
        templeId: bankDetail.templeId,
        razorpayContactId,
        razorpayFundAccountId,
        verificationStatus: 'pending',
        panNumber: bankDetail.panNumber?.trim().toUpperCase(),
        gstin: bankDetail.gstin?.trim()
          ? bankDetail.gstin.trim().toUpperCase()
          : undefined,
        payoutSchedule: bankDetail.payoutSchedule,
        status: 'pending',
      });
    } catch (error: any) {
      console.error(
        'RAZORPAY INITIAL BANK DETAIL ERROR:',
        error?.response?.data || error,
      );

      if (error instanceof HttpErrors.HttpError) {
        throw error;
      }

      throw new HttpErrors.BadRequest(
        JSON.stringify(
          error?.response?.data || {
            message: error?.message ?? 'Unable to create temple bank details',
          },
        ),
      );
    }
  }

  @post('/temple-bank-details/update')
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
              templeId: {
                type: 'string',
              },
              beneficiaryName: {
                type: 'string',
              },
              accountNumber: {
                type: 'string',
              },
              confirmAccountNumber: {
                type: 'string',
              },
              ifscCode: {
                type: 'string',
              },
              accountType: {
                type: 'string',
              },
              panNumber: {
                type: 'string',
              },
              gstin: {
                type: 'string',
              },
              payoutSchedule: {
                type: 'string',
              },
            },
          },
        },
      },
    })
    request: UpdateTempleBankDetailRequest,
  ): Promise<object> {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new HttpErrors.UnprocessableEntity('Razorpay keys are missing');
    }

    const {
      templeId,
      beneficiaryName,
      accountNumber,
      confirmAccountNumber,
      ifscCode,
      accountType,
      panNumber,
      gstin,
      payoutSchedule,
    } = request;

    if (
      !templeId?.trim() ||
      !beneficiaryName?.trim() ||
      !accountNumber?.trim() ||
      !confirmAccountNumber?.trim() ||
      !ifscCode?.trim() ||
      !accountType?.trim() ||
      !panNumber?.trim()
    ) {
      throw new HttpErrors.BadRequest(
        'Please provide all required bank details',
      );
    }

    if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      throw new HttpErrors.BadRequest(
        'Account number and re-entered account number do not match',
      );
    }

    const normalizedAccountType = accountType.trim().toLowerCase();

    if (!['savings', 'current'].includes(normalizedAccountType)) {
      throw new HttpErrors.BadRequest(
        'Account type must be Savings or Current',
      );
    }

    const existingBankDetail = await this.templeBankDetailRepository.findOne({
      where: {
        templeId: templeId.trim(),
      },
    });

    if (!existingBankDetail?.id) {
      throw new HttpErrors.NotFound(
        'Bank details were not found for this temple',
      );
    }

    if (!existingBankDetail.razorpayContactId) {
      throw new HttpErrors.BadRequest(
        'Razorpay contact ID was not found for this temple',
      );
    }

    if (existingBankDetail.status !== 'requested') {
      throw new HttpErrors.BadRequest(
        'There is no requested bank detail change for this temple',
      );
    }

    const oldFundAccountId = existingBankDetail.razorpayFundAccountId;

    try {
      const auth = {
        username: keyId,
        password: keySecret,
      };

      const fundAccountResponse = await axios.post(
        `${RAZORPAY_BASE_URL}/fund_accounts`,
        {
          contact_id: existingBankDetail.razorpayContactId,
          account_type: 'bank_account',
          bank_account: {
            name: beneficiaryName.trim(),
            ifsc: ifscCode.trim().toUpperCase(),
            account_number: accountNumber.trim(),
          },
        },
        {
          auth,
        },
      );

      const newFundAccountId = fundAccountResponse.data?.id;

      if (!newFundAccountId) {
        throw new HttpErrors.BadRequest(
          'Razorpay did not return a fund account ID',
        );
      }

      await this.templeBankDetailRepository.updateById(existingBankDetail.id, {
        razorpayFundAccountId: newFundAccountId,
        panNumber: panNumber.trim().toUpperCase(),
        gstin: gstin?.trim() ? gstin.trim().toUpperCase() : undefined,
        payoutSchedule:
          payoutSchedule?.trim() || existingBankDetail.payoutSchedule,
        verificationStatus: 'pending',
        status: 'updated',
      });

      const updatedBankDetail = await this.templeBankDetailRepository.findById(
        existingBankDetail.id,
      );

      return {
        success: true,
        message: 'Bank details updated successfully',
        previousFundAccountId: oldFundAccountId,
        bankDetail: {
          id: updatedBankDetail.id,
          templeId: updatedBankDetail.templeId,
          razorpayContactId: updatedBankDetail.razorpayContactId,
          razorpayFundAccountId: updatedBankDetail.razorpayFundAccountId,
          verificationStatus: updatedBankDetail.verificationStatus,
          status: updatedBankDetail.status,
          panNumber: updatedBankDetail.panNumber,
          gstin: updatedBankDetail.gstin,
          payoutSchedule: updatedBankDetail.payoutSchedule,
        },
      };
    } catch (error: any) {
      console.error(
        'RAZORPAY BANK DETAIL UPDATE ERROR:',
        error?.response?.data || error,
      );

      if (error instanceof HttpErrors.HttpError) {
        throw error;
      }

      throw new HttpErrors.BadRequest(
        JSON.stringify(
          error?.response?.data || {
            message: error?.message ?? 'Unable to update temple bank details',
          },
        ),
      );
    }
  }

  @get('/temple-bank-details/{templeId}')
  async findByTempleId(
    @param.path.string('templeId') templeId: string,
  ): Promise<object | null> {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new HttpErrors.UnprocessableEntity('Razorpay keys are missing');
    }
    const bankReference = await this.templeBankDetailRepository.findOne({
      where: {
        templeId,
      },
    });

    if (!bankReference) {
      return null;
    }

    const fundAccountId = bankReference.razorpayFundAccountId;

    if (!fundAccountId) {
      return {
        bankReference,
        razorpayBankDetails: null,
      };
    }

    try {
      const fundAccountResponse = await axios.get(
        `${RAZORPAY_BASE_URL}/fund_accounts/${fundAccountId}`,
        {
          auth: {
            username: keyId,
            password: keySecret,
          },
        },
      );

      return {
        bankReference,
        razorpayBankDetails: fundAccountResponse.data,
      };
    } catch (error: any) {
      console.error(
        'RAZORPAY FUND ACCOUNT FETCH ERROR:',
        error?.response?.data || error,
      );

      return {
        bankReference,
        razorpayBankDetails: null,
      };
    }
  }
}
