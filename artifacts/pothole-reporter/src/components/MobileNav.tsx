import { Home, Plus, FileText } from 'lucide-react';
import { Link, useRoute } from 'wouter';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const [isHome] = useRoute('/');
  const [isReport] = useRoute('/report');
  const [isReports] = useRoute('/reports/:id');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-card-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        <Link 
          href="/"
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors",
            isHome ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
          data-testid="link-nav-home"
        >
          <Home className="w-5 h-5" />
          <span className="text-xs font-medium">Home</span>
        </Link>
        
        <Link
          href="/report"
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-6 py-2 rounded-lg transition-all",
            isReport 
              ? "bg-primary text-primary-foreground scale-110" 
              : "bg-primary/10 text-primary hover:bg-primary/20"
          )}
          data-testid="link-nav-report"
        >
          <Plus className="w-6 h-6" />
          <span className="text-xs font-bold">Report</span>
        </Link>
        
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors",
            isReports ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
          data-testid="link-nav-reports"
        >
          <FileText className="w-5 h-5" />
          <span className="text-xs font-medium">Reports</span>
        </Link>
      </div>
    </nav>
  );
}
