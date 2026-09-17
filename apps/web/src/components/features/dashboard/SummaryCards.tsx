import { Transaction } from '@/types/transaction.type';

export default function SummaryCards({ data }: { data: Transaction[] }) {
  const totalAmount = data.reduce((sum, t) => sum + t.amount, 0);
  const temples = new Set(data.map((t) => t.templeName)).size;
  const lastDate = data[0]?.date;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card title="Total Offerings" value={`₹${totalAmount}`} />
      <Card title="Temples Visited" value={`${temples}`} />
      <Card title="Last Offering" value={lastDate} />
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border">
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-2xl font-semibold mt-2">{value}</h2>
    </div>
  );
}
