import { useParams, useLocation } from 'wouter';
import { useGetReport, useDeleteReport, getListReportsQueryKey, getGetReportStatsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { MobileNav } from '@/components/MobileNav';
import { StatusBadge } from '@/components/StatusBadge';
import { SeverityBadge } from '@/components/SeverityBadge';
import { DamageTypeBadge } from '@/components/DamageTypeBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, MapPin, Calendar, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ReportDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const reportId = Number(params.id);
  const { data: report, isLoading, error } = useGetReport(reportId);
  const deleteReport = useDeleteReport();

  const handleDelete = () => {
    deleteReport.mutate(
      { id: reportId },
      {
        onSuccess: () => {
          toast({
            title: 'Report deleted',
            description: 'The report has been removed.',
          });
          
          queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetReportStatsQueryKey() });
          
          setLocation('/');
        },
        onError: () => {
          toast({
            title: 'Delete failed',
            description: 'Could not delete report. Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-background pb-20">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Skeleton className="h-10 w-32 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-[100dvh] bg-background pb-20">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Alert variant="destructive">
            <AlertDescription>
              Report not found or could not be loaded.
            </AlertDescription>
          </Alert>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            data-testid="link-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-3" data-testid="text-page-title">
                Report #{report.id}
              </h1>
              <div className="flex items-center gap-2 flex-wrap">
                <DamageTypeBadge damageType={report.damageType} />
                <SeverityBadge severity={report.severity} />
                <StatusBadge status={report.status} />
              </div>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  data-testid="button-delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The report will be permanently removed from the system.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleteReport.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-testid="button-confirm-delete"
                  >
                    {deleteReport.isPending ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Photo */}
          {report.photoBase64 && (
            <Card className="overflow-hidden p-0">
              <img
                src={`data:image/jpeg;base64,${report.photoBase64}`}
                alt="Road damage"
                className="w-full aspect-video object-cover"
                data-testid="img-report-photo"
              />
            </Card>
          )}

          {/* Location */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Coordinates</div>
                <div className="font-mono text-sm" data-testid="text-coordinates">
                  {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                </div>
              </div>
              {report.address && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Address</div>
                  <div className="text-sm" data-testid="text-address">
                    {report.address}
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                asChild
                className="mt-2"
                data-testid="button-view-map"
              >
                <a
                  href={`https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}&zoom=16`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Map
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </Button>
            </div>
          </Card>

          {/* Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Reported</div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span data-testid="text-created-date">
                    {format(new Date(report.createdAt), 'PPpp')}
                  </span>
                </div>
              </div>
              
              {report.description && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Description</div>
                  <p className="text-sm whitespace-pre-wrap" data-testid="text-description">
                    {report.description}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <MobileNav />
    </div>
  );
}
