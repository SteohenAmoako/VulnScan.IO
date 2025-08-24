
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldCheck } from 'lucide-react';

export default function Loading() {
  return (
    <div className="container px-4 md:px-6 py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="relative mb-4">
            <ShieldCheck className="w-16 h-16 md:w-20 md:h-20 text-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-20 w-20 md:h-24 md:w-24 border-t-2 border-b-2 border-primary/50"></div>
            </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">Scanning in Progress...</h1>
        <p className="text-muted-foreground text-base md:text-xl mt-2 max-w-prose">Analyzing your website for vulnerabilities. This may take a minute.</p>
      </div>
      {/* Simplified skeleton for mobile, more complex for larger screens */}
      <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-pulse mb-8">
          <Skeleton className="h-32 md:h-40 w-full" />
          <Skeleton className="h-32 md:h-40 w-full" />
          <Skeleton className="h-32 md:h-40 w-full hidden lg:block" />
          <Skeleton className="h-32 md:h-40 w-full hidden xl:block" />
      </div>
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 animate-pulse">
        <div className="lg:col-span-2 space-y-8">
            <CardSkeleton />
        </div>
        <div className="lg:col-span-1">
            <CardSkeleton isSummary={true} />
        </div>
      </div>
    </div>
  );
}

function CardSkeleton({ isSummary = false }) {
    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-1/3" />
            </div>
            <Skeleton className="h-4 w-3/4 mb-6" />
            <div className="space-y-4">
                {isSummary ? (
                    <>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </>
                ) : (
                    <>
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </>
                )}
            </div>
        </div>
    )
}
