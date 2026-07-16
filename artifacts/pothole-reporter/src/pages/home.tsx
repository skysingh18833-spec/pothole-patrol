import { useListReports, useGetReportStats } from '@workspace/api-client-react';
import { ReportCard } from '@/components/ReportCard';
import { StatCard } from '@/components/StatCard';
import { MobileNav } from '@/components/MobileNav';
import { AlertTriangle, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetReportStats();
  const { data: reports, isLoading: reportsLoading, error } = useListReports({ limit: 10 });

  return (
    <div className="min-h-[100dvh] bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
            Road Damage Reporter
          </h1>
          <p className="text-muted-foreground">
            Community-powered infrastructure monitoring
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </Card>
              ))}
            </>
          ) : stats ? (
            <>
              <StatCard
                title="Total Reports"
                value={stats.total}
                icon={AlertTriangle}
                index={0}
              />
              <StatCard
                title="This Week"
                value={stats.recentCount}
                icon={TrendingUp}
                index={1}
              />
              <StatCard
                title="Pending"
                value={stats.byStatus?.find(s => s.key === 'pending')?.count || 0}
                icon={Clock}
                index={2}
              />
              <StatCard
                title="Resolved"
                value={stats.byStatus?.find(s => s.key === 'resolved')?.count || 0}
                icon={CheckCircle2}
                index={3}
              />
            </>
          ) : null}
        </div>

        {/* Recent Reports */}
        <div>
          <h2 className="text-xl font-bold mb-4" data-testid="text-section-title">
            Recent Reports
          </h2>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Failed to load reports. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {reportsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="flex gap-3">
                    <Skeleton className="w-20 h-20 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report, index) => (
                <ReportCard key={report.id} report={report} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="p-12 text-center border-dashed" data-testid="card-empty-state">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Start documenting road damage in your community. Tap the Report button below to submit your first observation.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
