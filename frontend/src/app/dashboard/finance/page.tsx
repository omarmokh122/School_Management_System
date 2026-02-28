import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect } from "next/navigation"
import { AddFinancialRecordModal } from "./AddFinancialRecordModal"
import { Download, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, Wallet } from "lucide-react"

const STATUS: Record<string, { label: string; cls: string }> = {
    paid: { label: 'مدفوع', cls: 'badge badge-green' },
    pending: { label: 'قيد الانتظار', cls: 'badge badge-yellow' },
    overdue: { label: 'متأخر', cls: 'badge badge-red' },
}

const TYPE: Record<string, string> = {
    invoice: 'فاتورة',
    payment: 'دفعة',
}

export default async function FinancePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const schoolId = user?.user_metadata?.school_id || '00000000-0000-0000-0000-000000000000'
    let records: any[] = [], students: any[] = []
    try {
        records = await fetchApi('/finance/') || []
        students = await fetchApi('/students/') || []
    } catch (e: any) { console.error(e?.message) }

    const totalInvoiced = records.filter(r => r.type === 'invoice').reduce((s, r) => s + parseFloat(r.amount || 0), 0)
    const totalPaid = records.filter(r => r.status === 'paid').reduce((s, r) => s + parseFloat(r.amount || 0), 0)
    const totalPending = records.filter(r => r.status === 'pending').reduce((s, r) => s + parseFloat(r.amount || 0), 0)
    const totalOverdue = records.filter(r => r.status === 'overdue').reduce((s, r) => s + parseFloat(r.amount || 0), 0)
    const $f = (n: number) => `$${n.toLocaleString('en', { minimumFractionDigits: 2 })}`

    const statCards = [
        { label: 'إجمالي الفواتير', value: $f(totalInvoiced), icon: Wallet, color: '#0056D2', bg: '#EFF6FF', sub: `${records.filter(r => r.type === 'invoice').length} فاتورة` },
        { label: 'إجمالي المدفوعات', value: $f(totalPaid), icon: CheckCircle2, color: '#059669', bg: '#F0FDF4', sub: `${records.filter(r => r.status === 'paid').length} سجل` },
        { label: 'قيد الانتظار', value: $f(totalPending), icon: Clock, color: '#D97706', bg: '#FFFBEB', sub: `${records.filter(r => r.status === 'pending').length} سجل` },
        { label: 'متأخرات', value: $f(totalOverdue), icon: AlertCircle, color: '#DC2626', bg: '#FEF2F2', sub: `${records.filter(r => r.status === 'overdue').length} سجل` },
    ]

    return (
        <div className="space-y-5 page-enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="section-title">الإدارة المالية</h1>
                    <p className="section-sub">الفواتير والمدفوعات والتقارير</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-secondary">
                        <Download className="h-4 w-4" />
                        تصدير
                    </button>
                    <AddFinancialRecordModal schoolId={schoolId} students={students} />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s) => (
                    <div key={s.label} className="card p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                                <s.icon className="h-5 w-5" style={{ color: s.color }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</span>
                        </div>
                        <p style={{ fontSize: '1.375rem', fontWeight: 800, color: s.color }}>{s.value}</p>
                        <p style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)', marginTop: 3 }}>{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>سجل المعاملات</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{records.length} سجل مالي</p>
                    </div>
                </div>

                {records.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                            <Wallet className="h-8 w-8" style={{ color: 'var(--blue-primary)' }} />
                        </div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>لا توجد سجلات مالية</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 4 }}>ابدأ بإضافة فاتورة أو دفعة</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>المعرّف</th>
                                    <th>المبلغ</th>
                                    <th>النوع</th>
                                    <th>الحالة</th>
                                    <th>تاريخ الاستحقاق</th>
                                    <th>ملاحظات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((r: any) => {
                                    const st = STATUS[r.status] || { label: r.status, cls: 'badge badge-slate' }
                                    return (
                                        <tr key={r.id}>
                                            <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                {String(r.id).slice(0, 8).toUpperCase()}
                                            </td>
                                            <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                                ${parseFloat(r.amount || 0).toLocaleString('en', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td>
                                                <span className={r.type === 'invoice' ? 'badge badge-blue' : 'badge badge-green'}>
                                                    {TYPE[r.type] || r.type}
                                                </span>
                                            </td>
                                            <td><span className={st.cls}>{st.label}</span></td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{r.due_date || '—'}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {r.description || '—'}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
