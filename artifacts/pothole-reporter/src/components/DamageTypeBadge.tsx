import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Waves, Trash2, Split, Mountain, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DamageTypeBadgeProps {
  damageType: string;
  className?: string;
  showIcon?: boolean;
}

export function DamageTypeBadge({ damageType, className, showIcon = true }: DamageTypeBadgeProps) {
  const config = {
    pothole: { label: 'Pothole', icon: Mountain },
    crack: { label: 'Crack', icon: Split },
    subsidence: { label: 'Subsidence', icon: AlertTriangle },
    flooding: { label: 'Flooding', icon: Waves },
    debris: { label: 'Debris', icon: Trash2 },
    other: { label: 'Other', icon: MoreHorizontal },
  }[damageType] || { label: damageType, icon: MoreHorizontal };

  const Icon = config.icon;

  return (
    <Badge 
      variant="secondary" 
      className={cn('font-medium', className)}
      data-testid={`badge-type-${damageType}`}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
