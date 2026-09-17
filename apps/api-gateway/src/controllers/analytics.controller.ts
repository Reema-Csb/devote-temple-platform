import {get, param, Request, response, RestBindings} from '@loopback/rest';
import {inject} from '@loopback/core';
import {ModifiedRestService, restService} from '@sourceloop/core';
import {Temple} from '../models';
import {PaymentService} from '../services/payment-service.service';

export class AnalyticsController {
  constructor(
    @restService(Temple)
    private templeService: ModifiedRestService<Temple>,
    @inject(RestBindings.Http.REQUEST)
    private req: Request,
    @inject('services.PaymentService')
    private paymentService: PaymentService,
  ) {}

  private getAuthHeader(): string {
    const authHeader = this.req.headers['authorization'];
    return typeof authHeader === 'string' ? authHeader : '';
  }

  @get('/analytics/donations/{userId}')
  @response(200, {description: 'Donation analytics for a user'})
  async getDonationAnalytics(
    @param.path.string('userId') userId: string,
  ): Promise<object> {
    try {
      const transactions =
        await this.paymentService.findTransactionsByUserId(userId);

      const successfulTransactions = transactions.filter(
        t => t.paymentStatus === 'success' || t.status === 'Success',
      );

      const totalDonation = successfulTransactions.reduce(
        (sum, t) => sum + Number(t.amount ?? 0),
        0,
      );

      const uniqueTemples = new Set(
        successfulTransactions.filter(t => t.templeId).map(t => t.templeId),
      );

      return {
        totalDonation,
        templesVisited: uniqueTemples.size,
        sevasDone: successfulTransactions.length,
      };
    } catch (error) {
      console.error('Analytics error:', error);
      return {totalDonation: 0, templesVisited: 0, sevasDone: 0};
    }
  }

  @get('/analytics/monthly/{userId}')
  @response(200, {description: 'Monthly donation overview for a user'})
  async getMonthlyOverview(
    @param.path.string('userId') userId: string,
  ): Promise<object> {
    try {
      const transactions =
        await this.paymentService.findTransactionsByUserId(userId);

      const successfulTransactions = transactions.filter(
        t => t.paymentStatus === 'success' || t.status === 'Success',
      );

      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      const monthlyMap: Record<string, number> = {};
      successfulTransactions.forEach(t => {
        if (t.paymentDate) {
          const date = new Date(t.paymentDate);
          const month = monthNames[date.getMonth()];
          monthlyMap[month] = (monthlyMap[month] ?? 0) + Number(t.amount ?? 0);
        }
      });

      const monthlyData = monthNames.map(m => ({
        month: m,
        amount: monthlyMap[m] ?? 0,
      }));

      return {monthlyData};
    } catch (error) {
      console.error('Monthly analytics error:', error);
      return {monthlyData: []};
    }
  }

  @get('/analytics/top-temples/{userId}')
  @response(200, {description: 'Top temples for a user'})
  async getTopTemples(
    @param.path.string('userId') userId: string,
  ): Promise<object> {
    try {
      const transactions =
        await this.paymentService.findTransactionsByUserId(userId);

      const successfulTransactions = transactions.filter(
        t => t.paymentStatus === 'success' || t.status === 'Success',
      );

      const templeMap: Record<string, number> = {};
      successfulTransactions.forEach(t => {
        const id = t.templeId!;
        templeMap[id] = (templeMap[id] ?? 0) + Number(t.amount ?? 0);
      });

      const total = Object.values(templeMap).reduce((s, v) => s + v, 0);
      const colors = ['#C8773A', '#B85C20', '#E8945A', '#D4720A', '#A0522D'];

      const sortedEntries = Object.entries(templeMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const topTemples = await Promise.all(
        sortedEntries.map(async ([templeId, amount], i) => {
          let templeName = `Temple ${i + 1}`;
          try {
            const temple = await this.templeService.findById(templeId);
            if (temple?.name) {
              templeName = temple.name;
            }
          } catch (err) {
            console.error(`Failed to fetch temple ${templeId}:`, err);
          }

          return {
            name: templeName,
            templeId,
            percent: total > 0 ? Math.round((amount / total) * 100) : 0,
            color: colors[i % colors.length],
          };
        }),
      );

      return {topTemples};
    } catch (error) {
      console.error('Top temples error:', error);
      return {topTemples: []};
    }
  }

  @get('/analytics/seva-distribution/{userId}')
  @response(200, {description: 'Seva distribution for a user'})
  async getSevaDistribution(
    @param.path.string('userId') userId: string,
  ): Promise<object> {
    try {
      const transactions =
        await this.paymentService.findTransactionsByUserId(userId);

      const successfulTransactions = transactions.filter(
        t => t.paymentStatus === 'success' || t.status === 'Success',
      );

      const sevaMap: Record<string, number> = {};
      successfulTransactions.forEach(t => {
        const key = t.remarks ?? 'Other';
        sevaMap[key] = (sevaMap[key] ?? 0) + 1;
      });

      const total = Object.values(sevaMap).reduce((s, v) => s + v, 0);
      const colors = ['#C8773A', '#E8A44A', '#8B4513', '#C4B49A', '#D4720A'];

      const sevaDistribution = Object.entries(sevaMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([name, count], i) => ({
          name,
          percent: total > 0 ? Math.round((count / total) * 100) : 0,
          color: colors[i % colors.length],
        }));

      return {sevaDistribution};
    } catch (error) {
      console.error('Seva distribution error:', error);
      return {sevaDistribution: []};
    }
  }
}
