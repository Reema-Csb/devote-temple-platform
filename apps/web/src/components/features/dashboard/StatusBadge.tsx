import { STATUS_STYLES } from '@/constants/status.const';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span
      className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold ${style}`}
    >
      {status}
    </span>
  );
}
