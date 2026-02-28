import { Download, TrendingUp, TrendingDown, Clock, DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect } from "next/navigation"
import { AddFinancialRecordModal } from "./AddFinancialRecordModal"

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
    paid: { label: 'مدفوع', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
    pending: { label: 'قيد الانتظار', cls: 'bg-yellow-50 text-yellow-700 border border-yellow-100' },
    overdue: { label: 'متأخر', cls: 'bg-red-50 text-red-700 border border-red-100' },
}

const TYPE_MAP: Record<string, string> = {
    invoice: 'فاتورة',
    payment: 'دفعة',
}

export default async function FinancePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const schoolId = user?.user_metadata?.school_id || '00000000-0000-0000-0000-000000000000'

    let records: any[] = []
    let students: any[] = []

    try {
        records = await fetchApi('/finance/') || []
        students = await fetchApi('/students/') || []
    } catch (e: any) {
        console.error("Finance page error:", e?.message || e)
    }

    // Compute stats
    const totalInvoiced = records
        .filter(r => r.type === 'invoice')
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0)

    const totalPaid = records
        .filter(r => r.status === 'paid' || r.type === 'payment')
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0)

    const totalOverdue = records
        .filter(r => r.status === 'overdue')
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0)

    const totalPending = records
        .filter(r => r.status === 'pending')
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0)

    const fmt = (n: number) => n.toLocaleString('ar-LB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">الإدارة المالية</h2>
                    <p className="text-sm text-slate-500 mt-0.5">الفواتير، المدفوعات، والتقارير المالية</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        <Download className="h-4 w-4" />
                        تصدير
                    </button>
                    <AddFinancialRecordModal schoolId={schoolId} students={students} />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">إجمالي الفواتير</span>
                        <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">${fmt(totalInvoiced)}</p>
                    <p className="text-xs text-slate-400 mt-1">{records.filter(r => r.type === 'invoice').length} فاتورة</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">مدفوع</span>
                        <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">${fmt(totalPaid)}</p>
                    <p className="text-xs text-slate-400 mt-1">{records.filter(r => r.status === 'paid').length} سجل</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">قيد الانتظار</span>
                        <div className="h-7 w-7 rounded-lg bg-yellow-50 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">${fmt(totalPending)}</p>
                    <p className="text-xs text-slate-400 mt-1">{records.filter(r => r.status === 'pending').length} سجل</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">متأخر</span>
                        <div className="h-7 w-7 rounded-lg bg-red-50 flex items-center justify-center">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-red-500">${fmt(totalOverdue)}</p>
                    <p className="text-xs text-slate-400 mt-1">{records.filter(r => r.status === 'overdue').length} سجل</p>
                </div>
            </div>

            {/* Records Table */}
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">سجلات المعاملات</h3>
                    <span className="text-xs text-slate-400">{records.length} سجل</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-right text-sm">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="py-3 pr-4 pl-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">معرّف السجل</th>
                                <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">المبلغ</th>
                                <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">النوع</th>
                                <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">الحالة</th>
                                <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">الاستحقاق</th>
                                <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ملاحظات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-14 text-slate-400">
                                        <div className="text-4xl mb-2">💳</div>
                                        <p className="text-sm">لا توجد سجلات مالية بعد. أضف فاتورة أو دفعة للبدء.</p>
                                    </td>
                                </tr>
                            ) : null}
                            {records.map((record: any) => {
                                const statusInfo = STATUS_MAP[record.status] || { label: record.status, cls: 'bg-slate-50 text-slate-500' }
                                return (
                                    <tr key={record.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="whitespace-nowrap py-3 pr-4 pl-3 font-mono text-xs text-slate-400">
                                            {String(record.id).slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-900">
                                            ${parseFloat(record.amount).toLocaleString('en', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                                            {TYPE_MAP[record.type] || record.type}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.cls}`}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-3 text-slate-500">{record.due_date || '—'}</td>
                                        <td className="whitespace-nowrap px-3 py-3 text-slate-400">{record.description || '—'}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
