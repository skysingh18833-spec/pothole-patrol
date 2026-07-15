import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    pending: { label: 'Pending', className: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
    in_review: { label: 'In Review', className: 'bg-blue-500/15 text-blue-700 border-blue-500/30' },
    resolved: { label: 'Resolved', className: 'bg-green-500/15 text-green-700 border-green-500/30' },
  }[status] || { label: status, className: 'bg-muted text-muted-foreground' };

  return (
    <Badge 
      variant="outline" 
      className={cn('font-medium', config.className, className)}
      data-testid={`badge-status-${status}`}
    >
      {config.label}
    </Badge>
  );
}
