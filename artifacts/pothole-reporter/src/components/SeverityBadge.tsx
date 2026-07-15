import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SeverityBadgeProps {
  severity: string;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = {
    low: { label: 'Low', className: 'bg-green-500/15 text-green-700 border-green-500/30' },
    medium: { label: 'Medium', className: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30' },
    high: { label: 'High', className: 'bg-orange-500/15 text-orange-700 border-orange-500/30' },
    critical: { label: 'Critical', className: 'bg-red-500/15 text-red-700 border-red-500/30' },
  }[severity] || { label: severity, className: 'bg-muted text-muted-foreground' };

  return (
    <Badge 
      variant="outline" 
      className={cn('font-medium', config.className, className)}
      data-testid={`badge-severity-${severity}`}
    >
      {config.label}
    </Badge>
  );
}
