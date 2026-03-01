export default function TeachersLoading() {
    return (
        <div className="space-y-5" dir="rtl">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-6 w-28 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-4 w-44 rounded-lg bg-slate-100 animate-pulse" />
                </div>
                <div className="h-9 w-28 rounded-lg bg-slate-200 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="card p-5 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse" />
                                <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
                            </div>
                        </div>
                        <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
                        <div className="h-3 w-2/3 rounded bg-slate-100 animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    )
}
