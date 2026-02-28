'use client'

import { useState } from 'react'
import { Download, FileText, BarChart3, DollarSign, Users, TrendingUp, Printer } from 'lucide-react'

interface Props { schoolId: string; students: any[]; classes: any[]; finance: any[] }

export function ReportsClient({ schoolId, students, classes, finance }: Props) {
    const [activeReport, setActiveReport] = useState<string | null>(null)

    // Finance stats
    const totalInvoiced = finance.reduce((s: number, r: any) => s + parseFloat(r.amount || 0), 0)
    const totalPaid = finance.filter((r: any) => r.status === 'paid').reduce((s: number, r: any) => s + parseFloat(r.amount || 0), 0)
    const totalPending = finance.filter((r: any) => r.status === 'pending').reduce((s: number, r: any) => s + parseFloat(r.amount || 0), 0)
    const totalOverdue = finance.filter((r: any) => r.status === 'overdue').reduce((s: number, r: any) => s + parseFloat(r.amount || 0), 0)

    // Grade distribution by class
    const classStats = classes.map(c => ({
        name: c.name,
        subject: c.subject || '—',
        count: c.students_count || 0,
    }))

    // Finance per student
    const studentFinance = students.map(s => {
        const recs = finance.filter((r: any) => r.student_id === s.id)
        const paid = recs.filter((r: any) => r.status === 'paid').reduce((sum: number, r: any) => sum + parseFloat(r.amount || 0), 0)
        const pending = recs.filter((r: any) => r.status === 'pending').reduce((sum: number, r: any) => sum + parseFloat(r.amount || 0), 0)
        const overdue = recs.filter((r: any) => r.status === 'overdue').reduce((sum: number, r: any) => sum + parseFloat(r.amount || 0), 0)
        return { ...s, paid, pending, overdue, total: paid + pending + overdue }
    }).filter(s => s.total > 0)

    const exportCSV = (headers: string[], rows: string[][], filename: string) => {
        const bom = '\uFEFF'  // Arabic UTF-8 BOM
        const csv = bom + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `${filename}.csv`; a.click()
        URL.revokeObjectURL(url)
    }

    const exportStudentsReport = () => exportCSV(
        ['الاسم الأول', 'الاسم الأخير', 'الصف', 'الشعبة', 'البريد الإلكتروني', 'الهاتف', 'تاريخ التسجيل'],
        students.map(s => [s.first_name, s.last_name, s.grade || '', s.section || '', s.email || '', s.phone || '', s.enrollment_date || '']),
        'students_report'
    )

    const exportFinanceReport = () => exportCSV(
        ['الطالب', 'المدفوع', 'المعلق', 'المتأخر', 'الإجمالي'],
        studentFinance.map(s => [`${s.first_name} ${s.last_name}`, s.paid.toFixed(2), s.pending.toFixed(2), s.overdue.toFixed(2), s.total.toFixed(2)]),
        'finance_report'
    )

    const exportClassesReport = () => exportCSV(
        ['اسم الفصل', 'المادة', 'عدد الطلاب'],
        classStats.map(c => [c.name, c.subject, String(c.count)]),
        'classes_report'
    )

    const REPORT_CARDS = [
        {
            id: 'students',
            title: 'تقرير الطلاب',
            desc: `${students.length} طالب مسجل — تصدير كامل البيانات`,
            icon: Users, bg: '#EFF6FF', color: '#0056D2',
            onExport: exportStudentsReport,
            preview: () => (
                <table className="data-table">
                    <thead><tr><th>الاسم</th><th>الصف</th><th>الشعبة</th><th>البريد</th></tr></thead>
                    <tbody>
                        {students.slice(0, 8).map((s: any) => (
                            <tr key={s.id}>
                                <td style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</td>
                                <td>{s.grade || '—'}</td>
                                <td>{s.section || '—'}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{s.email || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )
        },
        {
            id: 'finance',
            title: 'التقرير المالي',
            desc: `إجمالي: $${totalInvoiced.toFixed(0)} | مدفوع: $${totalPaid.toFixed(0)} | متأخر: $${totalOverdue.toFixed(0)}`,
            icon: DollarSign, bg: '#F0FDF4', color: '#059669',
            onExport: exportFinanceReport,
            preview: () => (
                <div>
                    <div className="grid grid-cols-4 gap-3 mb-4">
                        {[
                            { label: 'إجمالي', val: totalInvoiced, c: '#0056D2' },
                            { label: 'مدفوع', val: totalPaid, c: '#059669' },
                            { label: 'معلق', val: totalPending, c: '#D97706' },
                            { label: 'متأخر', val: totalOverdue, c: '#DC2626' },
                        ].map(item => (
                            <div key={item.label} className="card p-3 text-center">
                                <p style={{ fontSize: '1.125rem', fontWeight: 800, color: item.c }}>${item.val.toFixed(0)}</p>
                                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{item.label}</p>
                            </div>
                        ))}
                    </div>
                    <table className="data-table">
                        <thead><tr><th>الطالب</th><th>مدفوع</th><th>معلق</th><th>متأخر</th></tr></thead>
                        <tbody>
                            {studentFinance.slice(0, 6).map((s: any) => (
                                <tr key={s.id}>
                                    <td style={{ fontWeight: 600 }}>{s.first_name} {s.last_name}</td>
                                    <td style={{ color: '#059669', fontWeight: 600 }}>${s.paid.toFixed(0)}</td>
                                    <td style={{ color: '#D97706', fontWeight: 600 }}>${s.pending.toFixed(0)}</td>
                                    <td style={{ color: '#DC2626', fontWeight: 600 }}>${s.overdue.toFixed(0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        },
        {
            id: 'classes',
            title: 'تقرير الفصول',
            desc: `${classes.length} فصل دراسي — توزيع الطلاب والمواد`,
            icon: BarChart3, bg: '#F5F3FF', color: '#7C3AED',
            onExport: exportClassesReport,
            preview: () => (
                <div className="space-y-2">
                    {classStats.map((c, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.count} طالب</span>
                                </div>
                                <div style={{ height: 6, background: '#F3F4F6', borderRadius: 999 }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min((c.count / Math.max(...classStats.map(x => x.count), 1)) * 100, 100)}%`,
                                        background: 'linear-gradient(90deg, var(--blue-primary), #7C3AED)',
                                        borderRadius: 999,
                                        transition: 'width .3s',
                                    }} />
                                </div>
                            </div>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', width: 60, textAlign: 'center' }}>{c.subject}</span>
                        </div>
                    ))}
                </div>
            )
        },
    ]

    return (
        <div className="space-y-5 page-enter">
            <div>
                <h1 className="section-title">التقارير والتصدير</h1>
                <p className="section-sub">تصدير بيانات المدرسة بصيغة CSV أو طباعتها</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { icon: Users, label: 'إجمالي الطلاب', val: students.length, color: '#0056D2', bg: '#EFF6FF' },
                    { icon: BarChart3, label: 'إجمالي الفصول', val: classes.length, color: '#7C3AED', bg: '#F5F3FF' },
                    { icon: TrendingUp, label: 'نسبة التحصيل', val: `${totalPaid > 0 ? Math.round(totalPaid / totalInvoiced * 100) : 0}%`, color: '#059669', bg: '#F0FDF4' },
                ].map(item => (
                    <div key={item.label} className="card p-5 flex items-center gap-4">
                        <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                            <item.icon className="h-5 w-5" style={{ color: item.color }} />
                        </div>
                        <div>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{item.val}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Report Cards */}
            <div className="space-y-4">
                {REPORT_CARDS.map(report => (
                    <div key={report.id} className="card overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: report.bg }}>
                                    <report.icon className="h-5 w-5" style={{ color: report.color }} />
                                </div>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{report.title}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{report.desc}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className="btn-secondary"
                                    onClick={() => setActiveReport(activeReport === report.id ? null : report.id)}
                                    style={{ fontSize: '0.8125rem' }}
                                >
                                    <FileText className="h-3.5 w-3.5" />
                                    {activeReport === report.id ? 'إخفاء' : 'معاينة'}
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={report.onExport}
                                    style={{ fontSize: '0.8125rem' }}
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    تصدير CSV
                                </button>
                            </div>
                        </div>
                        {/* Preview */}
                        {activeReport === report.id && (
                            <div className="p-5">
                                {report.preview()}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Print hint */}
            <div className="card p-4 flex items-center gap-3" style={{ background: '#F9FAFB' }}>
                <Printer className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    لطباعة أي تقرير، افتح المعاينة ثم اضغط <kbd style={{ background: '#E5E7EB', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace' }}>Ctrl+P</kbd> أو <kbd style={{ background: '#E5E7EB', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace' }}>⌘+P</kbd>
                </p>
            </div>
        </div>
    )
}
