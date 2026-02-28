import { Users, GraduationCap, Wallet, BookOpen, TrendingUp, TrendingDown, ArrowUpRight, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    let students: any[] = [], teachers: any[] = [], finances: any[] = [], classes: any[] = []
    try {
        students = await fetchApi('/students/') || []
        teachers = await fetchApi('/teachers/') || []
        finances = await fetchApi('/finance/') || []
        classes = await fetchApi('/academic/classes/matrix') || []
    } catch { }

    const paid = finances.filter(f => f.status === 'paid').reduce((s, f) => s + parseFloat(f.amount || 0), 0)
    const pending = finances.filter(f => f.status === 'pending').reduce((s, f) => s + parseFloat(f.amount || 0), 0)
    const overdue = finances.filter(f => f.status === 'overdue')
    const $fmt = (n: number) => `$${n.toLocaleString('en', { minimumFractionDigits: 0 })}`

    const statCards = [
        { label: 'إجمالي الطلاب', value: students.length, icon: Users, color: '#0056D2', bg: '#EFF6FF', trend: '+8%', up: true },
        { label: 'أعضاء هيئة التدريس', value: teachers.length, icon: GraduationCap, color: '#7C3AED', bg: '#F5F3FF', trend: '+2', up: true },
        { label: 'الإيرادات المحصلة', value: $fmt(paid), icon: Wallet, color: '#059669', bg: '#F0FDF4', trend: $fmt(pending) + ' قيد الانتظار', up: pending === 0 },
        { label: 'الفصول الدراسية', value: classes.length, icon: BookOpen, color: '#D97706', bg: '#FFFBEB', trend: overdue.length === 0 ? 'لا متأخرات' : `${overdue.length} متأخرة`, up: overdue.length === 0 },
    ]

    return (
        <div className="space-y-6 page-enter">

            {/* Page header */}
            <div style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '1.25rem' }}>
                <h1 className="section-title">لوحة التحكم</h1>
                <p className="section-sub">نظرة عامة على أداء المدرسة</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s) => (
                    <div key={s.label} className="card p-5 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                                <s.icon className="h-5 w-5" style={{ color: s.color }} />
                            </div>
                            <span className="badge" style={{ background: s.up ? '#F0FDF4' : '#FEF2F2', color: s.up ? '#15803D' : '#B91C1C', border: s.up ? '1px solid #BBF7D0' : '1px solid #FECACA' }}>
                                {s.up ? <TrendingUp className="h-3 w-3 ml-1 inline" /> : <TrendingDown className="h-3 w-3 ml-1 inline" />}
                                {typeof s.value === 'number' ? `+${s.trend}` : s.trend}
                            </span>
                        </div>
                        <div>
                            <p style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Teachers Table */}
                <div className="lg:col-span-2 card overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>المعلمون المسجلون</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{teachers.length} معلم في النظام</p>
                        </div>
                        <a href="/dashboard/teachers" style={{ color: 'var(--blue-primary)', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            عرض الكل <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                    </div>
                    {teachers.length === 0 ? (
                        <div className="p-12 text-center" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>لا يوجد معلمون مسجلون بعد</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>المعلم</th>
                                    <th>التخصص</th>
                                    <th>التواصل</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.slice(0, 6).map((t: any) => (
                                    <tr key={t.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                {t.avatar_url ? (
                                                    <img src={t.avatar_url} className="h-8 w-8 rounded-full object-cover flex-shrink-0" alt="" />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'var(--blue-primary)' }}>
                                                        {t.first_name?.[0]}{t.last_name?.[0]}
                                                    </div>
                                                )}
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.first_name} {t.last_name}</span>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-blue">{t.specialization || 'بدون تخصص'}</span></td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{t.email || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">

                    {/* Finance Summary */}
                    <div className="card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>الملخص المالي</p>
                            <a href="/dashboard/finance" style={{ color: 'var(--blue-primary)', fontSize: '0.8125rem', fontWeight: 600 }}>التفاصيل</a>
                        </div>
                        <div className="space-y-2.5">
                            {[
                                { label: 'مدفوع', icon: CheckCircle2, color: '#059669', bg: '#F0FDF4', border: '#BBF7D0', val: $fmt(paid) },
                                { label: 'قيد الانتظار', icon: Clock, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', val: $fmt(pending) },
                                { label: 'متأخرات', icon: AlertCircle, color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', val: `${overdue.length} سجل` },
                            ].map(row => (
                                <div key={row.label} className="flex items-center justify-between rounded-lg px-3.5 py-2.5" style={{ background: row.bg, border: `1px solid ${row.border}` }}>
                                    <div className="flex items-center gap-2">
                                        <row.icon className="h-4 w-4" style={{ color: row.color }} />
                                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: row.color }}>{row.label}</span>
                                    </div>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: row.color }}>{row.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Students */}
                    <div className="card overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>آخر الطلاب</p>
                            <a href="/dashboard/students" style={{ color: 'var(--blue-primary)', fontSize: '0.8125rem', fontWeight: 600 }}>الكل</a>
                        </div>
                        <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                            {students.length === 0 ? (
                                <p className="p-5 text-center" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>لا يوجد طلاب بعد</p>
                            ) : students.slice(-6).reverse().map((s: any) => (
                                <div key={s.id} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid #F9FAFB' }}>
                                    <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: '#7C3AED' }}>
                                        {s.first_name?.[0]}{s.last_name?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.first_name} {s.last_name}</p>
                                        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{s.grade || '—'}{s.section && ` | ${s.section}`}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Classes */}
            <div className="card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>الفصول الدراسية</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{classes.length} فصل دراسي</p>
                    </div>
                    <a href="/dashboard/academics" style={{ color: 'var(--blue-primary)', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        إدارة الفصول <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                </div>
                {classes.length === 0 ? (
                    <div className="p-12 text-center" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>لا توجد فصول مضافة بعد</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>اسم الفصل</th>
                                <th>المادة</th>
                                <th>المعلم</th>
                                <th>الطلاب</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.slice(0, 6).map((c: any) => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                                    <td>
                                        {c.subject ? <span className="badge badge-violet">{c.subject}</span> : <span style={{ color: 'var(--text-subtle)' }}>—</span>}
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{c.teacher_name || '—'}</td>
                                    <td><span className="badge badge-slate">{c.students_count || 0} طالب</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
