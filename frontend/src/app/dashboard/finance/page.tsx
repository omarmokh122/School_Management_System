import { Plus, Download, Filter, Receipt } from "lucide-react"

const records = [
    { id: "INV-001", student: "عمر المختار", amount: "1,500 ₪", type: "فاتورة", status: "مدفوع", date: "2023-11-01" },
    { id: "INV-002", student: "سارة أحمد", amount: "1,500 ₪", type: "فاتورة", status: "متأخر", date: "2023-10-01" },
    { id: "PAY-001", student: "يوسف خليل", amount: "500 ₪", type: "دفعة", status: "مكتمل", date: "2023-11-05" },
]

export default function FinancePage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">المالية والتقارير</h2>
                    <p className="text-sm text-slate-500 mt-1">تتبع الفواتير، المدفوعات، وإصدار الإيصالات.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                        <Download className="h-4 w-4" />
                        تصدير تقرير
                    </button>
                    <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        <Plus className="h-4 w-4" />
                        إصدار فاتورة
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg shadow-indigo-200">
                    <Receipt className="h-8 w-8 text-white/80 mb-4" />
                    <p className="text-indigo-100 text-sm font-medium">إجمالي المتأخرات</p>
                    <p className="text-3xl font-bold mt-1">12,450 ₪</p>
                </div>
            </div>

            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600">
                        <Filter className="h-4 w-4" />
                        تصفية السجلات
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-right text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="py-3.5 pr-4 pl-3 font-semibold text-slate-900 sm:pr-6">رقم المعاملة</th>
                                <th scope="col" className="px-3 py-3.5 font-semibold text-slate-900">الطالب</th>
                                <th scope="col" className="px-3 py-3.5 font-semibold text-slate-900">المبلغ</th>
                                <th scope="col" className="px-3 py-3.5 font-semibold text-slate-900">النوع</th>
                                <th scope="col" className="px-3 py-3.5 font-semibold text-slate-900">الحالة</th>
                                <th scope="col" className="px-3 py-3.5 font-semibold text-slate-900">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {records.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="whitespace-nowrap py-4 pr-4 pl-3 font-medium text-indigo-600 sm:pr-6">
                                        {record.id}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-slate-900 font-medium">{record.student}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-slate-500 font-mono">{record.amount}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-slate-500">{record.type}</td>
                                    <td className="whitespace-nowrap px-3 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${record.status === 'مدفوع' || record.status === 'مكتمل'
                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
                                                : 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-slate-500">{record.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
