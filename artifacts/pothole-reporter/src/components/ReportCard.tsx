import { Card } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { SeverityBadge } from './SeverityBadge';
import { DamageTypeBadge } from './DamageTypeBadge';
import { MapPin, Calendar } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface ReportCardProps {
  report: {
    id: number;
    damageType: string;
    severity: string;
    status: string;
    latitude: number;
    longitude: number;
    address?: string | null;
    photoBase64?: string | null;
    createdAt: string;
  };
  index?: number;
}

export function ReportCard({ report, index = 0 }: ReportCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/reports/${report.id}`}>
        <Card 
          className="overflow-hidden hover-elevate transition-all duration-200 cursor-pointer border-card-border"
          data-testid={`card-report-${report.id}`}
        >
          <div className="flex gap-3 p-4">
            {report.photoBase64 && (
              <div className="flex-shrink-0 w-20 h-20 rounded-md overflow-hidden bg-muted">
                <img
                  src={`data:image/jpeg;base64,${report.photoBase64}`}
                  alt="Road damage"
                  className="w-full h-full object-cover"
                  data-testid={`img-report-${report.id}`}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <DamageTypeBadge damageType={report.damageType} />
                  <SeverityBadge severity={report.severity} />
                </div>
                <StatusBadge status={report.status} />
              </div>
              
              <div className="flex items-start gap-1.5 text-sm text-muted-foreground mb-1">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-1" data-testid={`text-address-${report.id}`}>
                  {report.address || `${report.latitude.toFixed(5)}, ${report.longitude.toFixed(5)}`}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span data-testid={`text-created-${report.id}`}>
                  {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
