import { STATUS_STYLES } from '@/constants/status.const';

interface BadgeProps {
  status: string;
}

export default function Badge({ status }: BadgeProps) {
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${style}`}>
      {status}
    </span>
  );
}