export default function DashboardLoading() {
    return (
        <div className="space-y-5" dir="rtl">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-6 w-40 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-4 w-56 rounded-lg bg-slate-100 animate-pulse" />
                </div>
                <div className="h-9 w-28 rounded-lg bg-slate-200 animate-pulse" />
            </div>

            {/* Stat cards skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="card p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="h-10 w-10 rounded-xl bg-slate-200 animate-pulse" />
                            <div className="h-4 w-16 rounded-lg bg-slate-100 animate-pulse" />
                        </div>
                        <div className="h-7 w-20 rounded-lg bg-slate-200 animate-pulse" />
                        <div className="h-3 w-24 rounded-lg bg-slate-100 animate-pulse" />
                    </div>
                ))}
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="card p-5 space-y-4">
                        <div className="h-5 w-32 rounded-lg bg-slate-200 animate-pulse" />
                        <div className="space-y-3">
                            {[...Array(5)].map((_, j) => (
                                <div key={j} className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />
                                        <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
                                    </div>
                                    <div className="h-5 w-14 rounded-full bg-slate-100 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
