import { Transaction } from '@/types/transaction.type';
import StatusBadge from './StatusBadge';
import { downloadReceipt } from '@/lib/generateReceipt';

interface TransactionDetailsProps {
  transactions: Transaction[];
}

export default function TransactionDetails({ transactions }: TransactionDetailsProps) {
  return (
    <>
      {transactions.map((tx) => (
        <tr
          key={tx.id}
          className="border-b border-[#EDE8DF] hover:bg-[#F7F3EC] transition-colors duration-150"
        >
          {/* Temple & Seva */}
          <td className="py-6 px-6">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-[#F0E9DC] flex items-center justify-center text-xl flex-shrink-0">
                {tx.templeIcon}
              </div>
              <div>
                <p className="font-semibold text-[#1A0F00] text-[15px] leading-snug">
                  {tx.templeName}
                </p>
                <p className="text-[#9C7E5A] text-[13px] mt-0.5">{tx.sevaName}</p>
              </div>
            </div>
          </td>

          {/* Transaction ID */}
          <td className="py-6 px-6">
            <span className="text-[14px] text-[#4A3728] font-mono tracking-wide">
              {tx.transactionId}
            </span>
          </td>

          {/* Date & Time */}
          <td className="py-6 px-6">
            <p className="text-[14px] font-medium text-[#1A0F00]">{tx.date}</p>
            <p className="text-[13px] text-[#9C7E5A] mt-0.5">{tx.time}</p>
          </td>

          {/* Amount */}
          <td className="py-6 px-6">
            <span className="text-[16px] font-semibold text-[#1A0F00] tracking-tight">
              ₹{tx.amount.toLocaleString('en-IN')}
            </span>
          </td>

          {/* Status */}
          <td className="py-6 px-6">
            <StatusBadge status={tx.status} />
          </td>

          {/* Action */}
          <td className="py-6 px-6">
            <button
              onClick={() => downloadReceipt(tx)}
              className="text-[14px] font-semibold text-[#9B4B1A] hover:text-[#6B2F0E] hover:underline underline-offset-2 transition-colors"
            >
              View Receipt
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
