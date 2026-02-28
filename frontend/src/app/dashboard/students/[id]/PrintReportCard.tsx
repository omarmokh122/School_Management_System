'use client'

import { Printer } from 'lucide-react'

interface Props {
    student: any
    attendance: any
    finance: any[]
}

export function PrintReportCard({ student, attendance, finance }: Props) {
    const paidFees = finance.filter(r => r.status === 'paid').reduce((s, r) => s + parseFloat(r.amount || 0), 0)
    const pendingFees = finance.filter(r => r.status === 'pending').reduce((s, r) => s + parseFloat(r.amount || 0), 0)
    const overdueFees = finance.filter(r => r.status === 'overdue').reduce((s, r) => s + parseFloat(r.amount || 0), 0)
    const attTotal = attendance?.total || 0
    const attPct = attTotal > 0 ? Math.round((attendance?.present || 0) / attTotal * 100) : 100

    const print = () => {
        window.print()
    }

    return (
        <>
            {/* Print trigger button — visible on screen only */}
            <button
                className="btn-secondary no-print"
                onClick={print}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}
            >
                <Printer className="h-4 w-4" />
                طباعة كشف الدرجات
            </button>

            {/* ── Printable Report Card — hidden on screen, shown only when printing ── */}
            <div className="print-only" id="report-card">
                <style>{`
                    @media print {
                        body > * { display: none !important; }
                        #report-card { display: block !important; }
                        .no-print { display: none !important; }
                        .print-only { display: block !important; }
                    }
                    @media screen {
                        .print-only { display: none; }
                    }
                    #report-card {
                        font-family: 'Segoe UI', Tahoma, sans-serif;
                        direction: rtl;
                        padding: 32px 40px;
                        color: #111;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .rc-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        border-bottom: 3px solid #0056D2;
                        padding-bottom: 16px;
                        margin-bottom: 24px;
                    }
                    .rc-school-name { font-size: 20px; font-weight: 800; color: #0056D2; }
                    .rc-title { font-size: 14px; color: #666; margin-top: 4px; }
                    .rc-date { font-size: 12px; color: #999; text-align: left; }
                    .rc-student-box {
                        background: #F8FAFF;
                        border: 1px solid #DBEAFE;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 24px;
                    }
                    .rc-student-name { font-size: 22px; font-weight: 800; color: #111; margin-bottom: 12px; }
                    .rc-meta-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
                    .rc-meta-item { }
                    .rc-meta-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 2px; }
                    .rc-meta-value { font-size: 13px; font-weight: 600; color: #222; }
                    .rc-section-title {
                        font-size: 13px; font-weight: 700; color: #0056D2;
                        text-transform: uppercase; letter-spacing: .5px;
                        border-bottom: 2px solid #DBEAFE; padding-bottom: 6px; margin-bottom: 12px;
                    }
                    .rc-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px; }
                    .rc-table th { background: #EFF6FF; color: #0056D2; font-weight: 700; padding: 8px 12px; border: 1px solid #BFDBFE; text-align: right; }
                    .rc-table td { padding: 7px 12px; border: 1px solid #E5E7EB; }
                    .rc-table tr:nth-child(even) td { background: #F9FAFB; }
                    .rc-att-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 24px; }
                    .rc-att-cell { text-align: center; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px; }
                    .rc-att-num { font-size: 22px; font-weight: 800; }
                    .rc-att-lbl { font-size: 11px; color: #555; margin-top: 2px; }
                    .rc-footer { margin-top: 40px; border-top: 1px solid #E5E7EB; padding-top: 16px; display: flex; justify-content: space-between; }
                    .rc-sign-box { text-align: center; }
                    .rc-sign-line { width: 160px; border-bottom: 1px solid #777; margin: 40px auto 4px; }
                    .rc-sign-label { font-size: 11px; color: #777; }
                    .rc-pct-badge {
                        display: inline-block;
                        padding: 2px 10px; border-radius: 20px; font-weight: 800; font-size: 13px;
                    }
                `}</style>

                {/* Header */}
                <div className="rc-header">
                    <div>
                        <div className="rc-school-name">🏫 إدارة المدرسة</div>
                        <div className="rc-title">كشف بيانات الطالب الرسمي</div>
                    </div>
                    <div className="rc-date">
                        تاريخ الإصدار: {new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* Student Info */}
                <div className="rc-student-box">
                    <div className="rc-student-name">{student.first_name} {student.last_name}</div>
                    <div className="rc-meta-grid">
                        <div className="rc-meta-item">
                            <div className="rc-meta-label">الصف الدراسي</div>
                            <div className="rc-meta-value">{student.grade || '—'}</div>
                        </div>
                        <div className="rc-meta-item">
                            <div className="rc-meta-label">الشعبة</div>
                            <div className="rc-meta-value">{student.section || '—'}</div>
                        </div>
                        <div className="rc-meta-item">
                            <div className="rc-meta-label">البريد الإلكتروني</div>
                            <div className="rc-meta-value">{student.email || '—'}</div>
                        </div>
                        <div className="rc-meta-item">
                            <div className="rc-meta-label">الهاتف</div>
                            <div className="rc-meta-value">{student.phone || '—'}</div>
                        </div>
                        <div className="rc-meta-item">
                            <div className="rc-meta-label">تاريخ التسجيل</div>
                            <div className="rc-meta-value">{student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString('ar-EG') : '—'}</div>
                        </div>
                        <div className="rc-meta-item">
                            <div className="rc-meta-label">نسبة الحضور</div>
                            <div className="rc-meta-value">
                                <span className="rc-pct-badge" style={{ background: attPct >= 90 ? '#F0FDF4' : attPct >= 75 ? '#FFFBEB' : '#FEF2F2', color: attPct >= 90 ? '#059669' : attPct >= 75 ? '#D97706' : '#DC2626' }}>
                                    {attPct}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance */}
                <div className="rc-section-title">سجل الحضور والغياب</div>
                <div className="rc-att-grid">
                    {[
                        { label: 'حاضر', val: attendance?.present || 0, color: '#059669' },
                        { label: 'غائب', val: attendance?.absent || 0, color: '#DC2626' },
                        { label: 'متأخر', val: attendance?.late || 0, color: '#D97706' },
                        { label: 'معذور', val: attendance?.excused || 0, color: '#7C3AED' },
                    ].map(a => (
                        <div key={a.label} className="rc-att-cell">
                            <div className="rc-att-num" style={{ color: a.color }}>{a.val}</div>
                            <div className="rc-att-lbl">{a.label}</div>
                        </div>
                    ))}
                </div>

                {/* Finance */}
                <div className="rc-section-title">الوضع المالي</div>
                <table className="rc-table">
                    <thead>
                        <tr><th>البند</th><th>المبلغ</th><th>الحالة</th></tr>
                    </thead>
                    <tbody>
                        {finance.length === 0 ? (
                            <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888' }}>لا توجد سجلات مالية</td></tr>
                        ) : finance.map((r: any) => (
                            <tr key={r.id}>
                                <td>{r.description || r.type || '—'}</td>
                                <td style={{ fontWeight: 700 }}>${parseFloat(r.amount || 0).toFixed(0)}</td>
                                <td style={{ color: r.status === 'paid' ? '#059669' : r.status === 'overdue' ? '#DC2626' : '#D97706', fontWeight: 600 }}>
                                    {r.status === 'paid' ? 'مدفوع' : r.status === 'overdue' ? 'متأخر' : 'معلق'}
                                </td>
                            </tr>
                        ))}
                        <tr style={{ fontWeight: 800, background: '#F0FDF4' }}>
                            <td>إجمالي المدفوع</td>
                            <td style={{ color: '#059669' }}>${paidFees.toFixed(0)}</td>
                            <td></td>
                        </tr>
                        {pendingFees > 0 && (
                            <tr style={{ fontWeight: 800, background: '#FFFBEB' }}>
                                <td>المبلغ المستحق</td>
                                <td style={{ color: '#D97706' }}>${(pendingFees + overdueFees).toFixed(0)}</td>
                                <td></td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Signature Footer */}
                <div className="rc-footer">
                    <div className="rc-sign-box">
                        <div className="rc-sign-line" />
                        <div className="rc-sign-label">توقيع المدير</div>
                    </div>
                    <div className="rc-sign-box">
                        <div className="rc-sign-line" />
                        <div className="rc-sign-label">توقيع ولي الأمر</div>
                    </div>
                    <div className="rc-sign-box">
                        <div className="rc-sign-line" />
                        <div className="rc-sign-label">الختم الرسمي</div>
                    </div>
                </div>
            </div>
        </>
    )
}
