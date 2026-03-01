export default function StudentsLoading() {
    return (
        <div className="space-y-5" dir="rtl">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="h-6 w-24 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-4 w-40 rounded-lg bg-slate-100 animate-pulse" />
                </div>
                <div className="flex gap-2">
                    <div className="h-9 w-28 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-9 w-28 rounded-lg bg-slate-200 animate-pulse" />
                </div>
            </div>
            <div className="card overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                    <div className="h-4 w-32 rounded-lg bg-slate-200 animate-pulse" />
                </div>
                <div className="divide-y divide-slate-50">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4">
                            <div className="h-9 w-9 rounded-full bg-slate-200 animate-pulse flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3.5 w-36 rounded bg-slate-200 animate-pulse" />
                                <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
                            </div>
                            <div className="h-5 w-20 rounded-full bg-slate-100 animate-pulse" />
                            <div className="h-5 w-16 rounded-full bg-slate-100 animate-pulse" />
                            <div className="h-7 w-16 rounded-lg bg-slate-100 animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
