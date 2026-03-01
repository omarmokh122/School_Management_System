import { Users, GraduationCap, Wallet, BookOpen, TrendingUp, TrendingDown, ArrowUpRight, CheckCircle2, Clock, AlertCircle, CalendarDays } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { fetchApiCached } from "@/lib/fetchApi"
import { redirect } from "next/navigation"
import Link from "next/link"

// ─── SVG Bar Chart ───────────────────────────────────────────
function BarChart({ data }: { data: { label: string; value: number; color?: string }[] }) {
    const max = Math.max(...data.map(d => d.value), 1)
    return (
        <div className="flex items-end gap-2" style={{ height: 120 }}>
            {data.map((d, i) => {
                const pct = Math.round((d.value / max) * 100)
                return (
                    <div key={i} className="flex flex-col items-center flex-1 gap-1" title={`${d.label}: ${d.value}`}>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                            {d.value > 0 ? d.value : ''}
                        </span>
                        <div style={{ width: '100%', height: 90, display: 'flex', alignItems: 'flex-end' }}>
                            <div
                                style={{
                                    width: '100%',
                                    height: `${pct}%`,
                                    minHeight: d.value > 0 ? 4 : 0,
                                    background: d.color || 'var(--blue-primary)',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.5s ease',
                                    opacity: 0.85,
                                }}
                            />
                        </div>
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-subtle)', textAlign: 'center', lineHeight: 1.2 }}>
                            {d.label}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

// ─── SVG Donut Chart ─────────────────────────────────────────
function DonutChart({ segments }: { segments: { value: number; color: string; label: string }[] }) {
    const total = segments.reduce((s, d) => s + d.value, 0) || 1
    const r = 36, cx = 44, cy = 44, stroke = 12
    const circumference = 2 * Math.PI * r
    let offset = 0

    return (
        <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={stroke} />
            {segments.map((seg, i) => {
                const dash = (seg.value / total) * circumference
                const el = (
                    <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                        stroke={seg.color} strokeWidth={stroke}
                        strokeDasharray={`${dash} ${circumference - dash}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="butt"
                    />
                )
                offset += dash
                return el
            })}
        </svg>
    )
}

// ─── Mini Progress Bar ───────────────────────────────────────
function ProgressBar({ pct, color }: { pct: number; color: string }) {
    return (
        <div style={{ height: 7, background: '#F3F4F6', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 999, transition: 'width 0.5s' }} />
        </div>
    )
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    let students: any[] = [], teachers: any[] = [], finances: any[] = [], classes: any[] = [], announcements: any[] = [], events: any[] = []
    try {
        [students, teachers, finances, classes, announcements] = await Promise.all([
            fetchApiCached('/students/', 30).then(d => d || []),
            fetchApiCached('/teachers/', 30).then(d => d || []),
            fetchApiCached('/finance/', 30).then(d => d || []),
            fetchApiCached('/academic/classes/matrix', 60).then(d => d || []),
            fetchApiCached('/announcements/', 60).then(d => d || []),
        ])
        const now = new Date()
        events = await fetchApiCached(`/calendar/?year=${now.getFullYear()}&month=${now.getMonth() + 1}`, 60).then(d => d || [])
    } catch { }

    // Financial calculations
    const paid = finances.filter(f => f.status === 'paid').reduce((s, f) => s + parseFloat(f.amount || 0), 0)
    const pending = finances.filter(f => f.status === 'pending').reduce((s, f) => s + parseFloat(f.amount || 0), 0)
    const overdue = finances.filter(f => f.status === 'overdue').reduce((s, f) => s + parseFloat(f.amount || 0), 0)
    const totalFinance = paid + pending + overdue
    const $fmt = (n: number) => `$${n.toLocaleString('en', { minimumFractionDigits: 0 })}`

    // Students per grade distribution
    const gradeMap: Record<string, number> = {}
    students.forEach((s: any) => { const g = s.grade || 'غير محدد'; gradeMap[g] = (gradeMap[g] || 0) + 1 })
    const GRADE_COLORS = ['#0056D2', '#7C3AED', '#059669', '#D97706', '#DC2626', '#0891B2', '#9333EA', '#15803D', '#B45309', '#B91C1C', '#0369A1', '#6D28D9']
    const gradeData = Object.entries(gradeMap).map(([label, value], i) => ({
        label: label.replace('الصف ', '').replace(' ابتدائي', '\nابتدائي').replace(' إعدادي', '\nإعدادي').replace(' ثانوي', '\nثانوي'),
        value,
        color: GRADE_COLORS[i % GRADE_COLORS.length]
    }))

    // Finance donut data
    const financeSegments = [
        { value: paid, color: '#059669', label: 'مدفوع' },
        { value: pending, color: '#D97706', label: 'معلق' },
        { value: overdue, color: '#DC2626', label: 'متأخر' },
    ]

    // Top stat cards
    const statCards = [
        { label: 'إجمالي الطلاب', value: students.length, icon: Users, color: '#0056D2', bg: '#EFF6FF', sub: `${classes.length} فصل` },
        { label: 'أعضاء هيئة التدريس', value: teachers.length, icon: GraduationCap, color: '#7C3AED', bg: '#F5F3FF', sub: 'معلم نشط' },
        { label: 'الإيرادات المحصلة', value: $fmt(paid), icon: Wallet, color: '#059669', bg: '#F0FDF4', sub: `${$fmt(pending)} معلق` },
        { label: 'إجمالي الفصول', value: classes.length, icon: BookOpen, color: '#D97706', bg: '#FFFBEB', sub: `${classes.reduce((s: number, c: any) => s + (c.students_count || 0), 0)} طالب مسجل` },
    ]

    // Upcoming events (next 7 days)
    const todayStr = new Date().toISOString().split('T')[0]
    const EVENT_TYPE_COLORS: Record<string, { color: string; bg: string }> = {
        exam: { color: '#DC2626', bg: '#FEF2F2' },
        holiday: { color: '#059669', bg: '#F0FDF4' },
        meeting: { color: '#0056D2', bg: '#EFF6FF' },
        activity: { color: '#7C3AED', bg: '#F5F3FF' },
    }
    const upcomingEvents = events.filter((e: any) => e.start_date >= todayStr).slice(0, 5)

    return (
        <div className="space-y-6 page-enter">
            {/* Header */}
            <div style={{ borderBottom: '1px solid #F3F4F6', paddingBottom: '1rem' }}>
                <h1 className="section-title">لوحة التحكم</h1>
                <p className="section-sub">نظرة شاملة على أداء المدرسة</p>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s) => (
                    <div key={s.label} className="card p-5 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                                <s.icon className="h-5 w-5" style={{ color: s.color }} />
                            </div>
                        </div>
                        <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</p>
                        <div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</p>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)', marginTop: 2 }}>{s.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Students by Grade Bar Chart */}
                <div className="lg:col-span-2 card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>توزيع الطلاب حسب الصف</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{students.length} طالب في {Object.keys(gradeMap).length} صف</p>
                        </div>
                        <Link href="/dashboard/students" style={{ color: 'var(--blue-primary)', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                            عرض الكل <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    {gradeData.length > 0 ? (
                        <BarChart data={gradeData} />
                    ) : (
                        <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)', fontSize: '0.875rem' }}>
                            أضف طلاباً لعرض الرسم البياني
                        </div>
                    )}
                </div>

                {/* Finance Donut */}
                <div className="card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>ملخص الإيرادات</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>إجمالي {$fmt(totalFinance)}</p>
                        </div>
                        <Link href="/dashboard/finance" style={{ color: 'var(--blue-primary)', fontSize: '0.8125rem', fontWeight: 600 }}>تفاصيل</Link>
                    </div>
                    <div className="flex items-center justify-center mb-4" style={{ position: 'relative' }}>
                        <DonutChart segments={financeSegments} />
                        <div style={{ position: 'absolute', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>محصّل</p>
                            <p style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#059669' }}>
                                {totalFinance > 0 ? Math.round(paid / totalFinance * 100) : 0}%
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2.5">
                        {[
                            { label: 'مدفوع', val: paid, color: '#059669', pct: totalFinance > 0 ? paid / totalFinance * 100 : 0 },
                            { label: 'معلق', val: pending, color: '#D97706', pct: totalFinance > 0 ? pending / totalFinance * 100 : 0 },
                            { label: 'متأخر', val: overdue, color: '#DC2626', pct: totalFinance > 0 ? overdue / totalFinance * 100 : 0 },
                        ].map(row => (
                            <div key={row.label}>
                                <div className="flex justify-between mb-1">
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{row.label}</span>
                                    <span style={{ fontSize: '0.75rem', color: row.color, fontWeight: 700 }}>{$fmt(row.val)}</span>
                                </div>
                                <ProgressBar pct={row.pct} color={row.color} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Classes with enrollment bars */}
                <div className="lg:col-span-2 card overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>الفصول الدراسية</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{classes.length} فصل دراسي</p>
                        </div>
                        <Link href="/dashboard/academics" style={{ color: 'var(--blue-primary)', fontSize: '0.8125rem', fontWeight: 600 }}>إدارة الفصول</Link>
                    </div>
                    {classes.length === 0 ? (
                        <div className="p-12 text-center" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>لا توجد فصول مضافة بعد</div>
                    ) : (
                        <div className="p-5 space-y-4">
                            {classes.slice(0, 6).map((c: any) => {
                                const maxStudents = Math.max(...classes.map((x: any) => x.students_count || 0), 1)
                                const pct = ((c.students_count || 0) / maxStudents) * 100
                                return (
                                    <div key={c.id}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <div className="flex items-center gap-2.5">
                                                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{c.name}</span>
                                                {c.subject && <span className="badge badge-violet" style={{ fontSize: '0.625rem' }}>{c.subject}</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.teacher_name?.split(' ').slice(0, 2).join(' ') || '—'}</span>
                                                <span className="badge badge-slate">{c.students_count || 0} طالب</span>
                                            </div>
                                        </div>
                                        <ProgressBar pct={pct} color="var(--blue-primary)" />
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Right column: Announcements + upcoming events */}
                <div className="space-y-4">
                    {/* Urgent announcements */}
                    {announcements.filter((a: any) => a.priority === 'urgent').length > 0 && (
                        <div className="card p-4" style={{ borderRight: '4px solid #EF4444' }}>
                            <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#DC2626', marginBottom: 8 }}>⚠️ إعلانات عاجلة</p>
                            {announcements.filter((a: any) => a.priority === 'urgent').slice(0, 2).map((a: any) => (
                                <div key={a.id} style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>• {a.title}</div>
                            ))}
                            <Link href="/dashboard/announcements" style={{ fontSize: '0.75rem', color: 'var(--blue-primary)', fontWeight: 600 }}>عرض الكل →</Link>
                        </div>
                    )}

                    {/* Upcoming events */}
                    <div className="card overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <div className="flex items-center gap-2">
                                <CalendarDays className="h-4 w-4" style={{ color: 'var(--blue-primary)' }} />
                                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>الأحداث القادمة</p>
                            </div>
                            <Link href="/dashboard/calendar" style={{ color: 'var(--blue-primary)', fontSize: '0.8125rem', fontWeight: 600 }}>الكل</Link>
                        </div>
                        {upcomingEvents.length === 0 ? (
                            <div className="p-6 text-center" style={{ color: 'var(--text-subtle)', fontSize: '0.8125rem' }}>لا توجد أحداث قادمة</div>
                        ) : (
                            <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
                                {upcomingEvents.map((ev: any) => {
                                    const tc = EVENT_TYPE_COLORS[ev.event_type] || EVENT_TYPE_COLORS.activity
                                    return (
                                        <div key={ev.id} className="flex items-center gap-3 px-5 py-3">
                                            <div className="h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: tc.bg, color: tc.color }}>
                                                {new Date(ev.start_date).getDate()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</p>
                                                <p style={{ fontSize: '0.6875rem', color: tc.color, fontWeight: 600 }}>
                                                    {ev.event_type === 'exam' ? 'امتحان' : ev.event_type === 'holiday' ? 'إجازة' : ev.event_type === 'meeting' ? 'اجتماع' : 'نشاط'}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Recent students */}
                    <div className="card overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>آخر الطلاب</p>
                            <Link href="/dashboard/students" style={{ color: 'var(--blue-primary)', fontSize: '0.8125rem', fontWeight: 600 }}>الكل</Link>
                        </div>
                        {students.slice(-5).reverse().map((s: any) => (
                            <Link key={s.id} href={`/dashboard/students/${s.id}`}
                                className="flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors"
                                style={{ borderBottom: '1px solid #F9FAFB', textDecoration: 'none' }}
                            >
                                <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: '#7C3AED' }}>
                                    {s.first_name?.[0]}{s.last_name?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.first_name} {s.last_name}</p>
                                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{s.grade || '—'}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
