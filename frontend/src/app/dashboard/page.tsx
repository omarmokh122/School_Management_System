import { Users, GraduationCap, Wallet, TrendingUp } from "lucide-react"

const stats = [
    { name: "إجمالي الطلاب", stat: "1,245", icon: Users, change: "12%", changeType: "increase" },
    { name: "إجمالي المعلمين", stat: "84", icon: GraduationCap, change: "2%", changeType: "increase" },
    { name: "الإيرادات", stat: "1.2M", icon: Wallet, change: "4.1%", changeType: "increase" },
    { name: "النمو", stat: "24.5%", icon: TrendingUp, change: "1.2%", changeType: "increase" },
]

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">نظرة عامة</h2>
                <p className="mt-2 text-sm text-slate-500">
                    مرحباً بعودتك! إليك ملخص لأداء المدرسة هذا الشهر.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div
                        key={item.name}
                        className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                    >
                        <dt>
                            <div className="absolute rounded-xl bg-indigo-50 p-3 group-hover:bg-indigo-100 transition-colors">
                                <item.icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                            </div>
                            <p className="mr-16 truncate text-sm font-medium text-slate-500">{item.name}</p>
                        </dt>
                        <dd className="mr-16 flex items-baseline pb-1 sm:pb-2">
                            <p className="text-2xl font-semibold text-slate-900">{item.stat}</p>
                            <p
                                className={`ml-2 flex items-baseline text-sm font-semibold ${item.changeType === "increase" ? "text-emerald-600" : "text-red-600"
                                    }`}
                            >
                                {item.changeType === "increase" ? "↑" : "↓"}
                                {item.change}
                            </p>
                        </dd>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-50 h-2" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Placeholder for charts */}
                <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm h-96 flex items-center justify-center">
                    <p className="text-slate-400 font-medium">مساحة الرسم البياني للطلاب</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm h-96 flex items-center justify-center">
                    <p className="text-slate-400 font-medium">مساحة الرسم البياني للمالية</p>
                </div>
            </div>
        </div>
    )
}
