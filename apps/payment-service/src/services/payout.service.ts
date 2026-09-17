import {repository} from '@loopback/repository';
import {PaymentTransactionRepository, PayoutRepository} from '../repositories';

const COMMISSION_PERCENT = 10;
const GST_ON_COMMISSION_PERCENT = 18;
const GATEWAY_CHARGE_PERCENT = 2;

export class PayoutService {
  constructor(
    @repository(PaymentTransactionRepository)
    private paymentTransactionRepository: PaymentTransactionRepository,

    @repository(PayoutRepository)
    private payoutRepository: PayoutRepository,
  ) {}

  async calculateTemplePayout(templeId: string) {
    const transactions = await this.paymentTransactionRepository.find();

    const successfulTempleTransactions = transactions.filter(
      tx => tx.templeId === templeId && tx.paymentStatus === 'success',
    );

    const payouts = await this.payoutRepository.find();

    const paidTemplePayouts = payouts.filter(
      payout => payout.templeId === templeId && payout.payoutStatus === 'paid',
    );

    const totalPaidAlready = paidTemplePayouts.reduce(
      (sum, payout) => sum + Number(payout.totalCollected ?? 0),
      0,
    );

    const totalSuccessCollected = successfulTempleTransactions.reduce(
      (sum, tx) => sum + Number(tx.amount ?? 0),
      0,
    );

    const pendingCollected = Math.max(
      totalSuccessCollected - totalPaidAlready,
      0,
    );

    const platformCommissionAmount =
      (pendingCollected * COMMISSION_PERCENT) / 100;

    const gstAmount =
      (platformCommissionAmount * GST_ON_COMMISSION_PERCENT) / 100;

    const gatewayChargeAmount =
      (pendingCollected * GATEWAY_CHARGE_PERCENT) / 100;

    const payoutAmount =
      pendingCollected -
      platformCommissionAmount -
      gstAmount -
      gatewayChargeAmount;

    return {
      templeId,
      totalCollected: Number(pendingCollected.toFixed(2)),
      platformCommissionAmount: Number(platformCommissionAmount.toFixed(2)),
      gstAmount: Number(gstAmount.toFixed(2)),
      gatewayChargeAmount: Number(gatewayChargeAmount.toFixed(2)),
      commissionAmount: Number(platformCommissionAmount.toFixed(2)),
      payoutAmount: Number(payoutAmount.toFixed(2)),
      transactionCount: successfulTempleTransactions.length,
    };
  }

  async markTemplePayoutPaid(templeId: string, remarks?: string) {
    const calculated = await this.calculateTemplePayout(templeId);

    if (calculated.totalCollected <= 0) {
      return {
        success: false,
        message: 'No pending payout amount for this temple',
        data: calculated,
      };
    }

    const payout = await this.payoutRepository.create({
      templeId,
      totalCollected: calculated.totalCollected,
      commissionAmount: calculated.commissionAmount,
      platformCommissionAmount: calculated.platformCommissionAmount,
      gstAmount: calculated.gstAmount,
      gatewayChargeAmount: calculated.gatewayChargeAmount,
      payoutAmount: calculated.payoutAmount,
      transactionCount: calculated.transactionCount,
      payoutMethod: 'manual',
      payoutStatus: 'paid',
      remarks,
      paidOn: new Date(),
    });

    return {
      success: true,
      message: 'Payout marked as paid successfully',
      payout,
    };
  }
}
