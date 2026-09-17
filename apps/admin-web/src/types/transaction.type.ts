export type TransactionStatus = 'Completed' | 'Pending' | 'Failed';

export interface Transaction {
  id: string;
  templeName: string;
  sevaName: string;
  templeIcon: string;
  transactionId: string;
  date: string;
  time: string;
  amount: number;
  status: TransactionStatus;
}