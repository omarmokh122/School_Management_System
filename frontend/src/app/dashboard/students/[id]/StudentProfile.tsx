'use client'

import { ArrowRight, CheckCircle2, XCircle, Clock, AlertCircle, CreditCard, BookOpen, Calendar } from 'lucide-react'
import Link from 'next/link'
import { PrintReportCard } from './PrintReportCard'


const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    present: { label: 'حاضر', color: '#059669', bg: '#F0FDF4', icon: CheckCircle2 },
    absent: { label: 'غائب', color: '#DC2626', bg: '#FEF2F2', icon: XCircle },
    late: { label: 'متأخر', color: '#D97706', bg: '#FFFBEB', icon: Clock },
    excused: { label: 'معذور', color: '#7C3AED', bg: '#F5F3FF', icon: AlertCircle },
}

interface Props { student: any; attendance: any; finance: any[]; schoolId: string }

export function StudentProfile({ student, attendance, finance, schoolId }: Props) {
    if (!student) return null

    const totalFees = finance.reduce((sum: number, r: any) => sum + parseFloat(r.amount || 0), 0)
    const paidFees = finance.filter((r: any) => r.status === 'paid').reduce((sum: number, r: any) => sum + parseFloat(r.amount || 0), 0)
    const pendingFees = finance.filter((r: any) => r.status === 'pending').reduce((sum: number, r: any) => sum + parseFloat(r.amount || 0), 0)
    const overdueFees = finance.filter((r: any) => r.status === 'overdue').reduce((sum: number, r: any) => sum + parseFloat(r.amount || 0), 0)

    const attTotal = attendance?.total || 0
    const attPct = attTotal > 0 ? Math.round((attendance?.present || 0) / attTotal * 100) : 100

    return (
        <div className="space-y-5 page-enter">
            {/* Breadcrumb + Print */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <Link href="/dashboard/students" className="hover:underline" style={{ color: 'var(--blue-primary)' }}>الطلاب</Link>
                    <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{student.first_name} {student.last_name}</span>
                </div>
                <PrintReportCard student={student} attendance={attendance} finance={finance} />
            </div>

            {/* Hero Card */}
            <div className="card p-6">
                <div className="flex items-start gap-5">
                    <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--blue-primary), #7C3AED)' }}>
                        {student.first_name?.[0]}{student.last_name?.[0]}
                    </div>
                    <div className="flex-1">
                        <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                            {student.first_name} {student.last_name}
                        </h1>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {student.grade && <span className="badge badge-blue">الصف: {student.grade}</span>}
                            {student.section && <span className="badge badge-violet">الشعبة: {student.section}</span>}
                            <span className="badge" style={{
                                background: attPct >= 90 ? '#F0FDF4' : attPct >= 75 ? '#FFFBEB' : '#FEF2F2',
                                color: attPct >= 90 ? '#059669' : attPct >= 75 ? '#D97706' : '#DC2626',
                                border: '1px solid currentColor',
                                padding: '2px 8px', borderRadius: 6, fontSize: '0.6875rem', fontWeight: 700,
                            }}>
                                الحضور {attPct}%
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                            {student.email && (
                                <div>
                                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 1 }}>البريد الإلكتروني</p>
                                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.email}</p>
                                </div>
                            )}
                            {student.phone && (
                                <div>
                                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 1 }}>الهاتف</p>
                                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{student.phone}</p>
                                </div>
                            )}
                            {student.enrollment_date && (
                                <div>
                                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: 1 }}>تاريخ التسجيل</p>
                                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {new Date(student.enrollment_date).toLocaleDateString('ar-EG')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left: Attendance Summary */}
                <div className="space-y-4">
                    <div className="card p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar className="h-4 w-4" style={{ color: 'var(--blue-primary)' }} />
                            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>ملخص الحضور</h3>
                        </div>
                        {/* Circular progress */}
                        <div className="flex items-center justify-center mb-4">
                            <div style={{ position: 'relative', width: 88, height: 88 }}>
                                <svg width="88" height="88" viewBox="0 0 88 88">
                                    <circle cx="44" cy="44" r="36" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                                    <circle cx="44" cy="44" r="36" fill="none"
                                        stroke={attPct >= 90 ? '#059669' : attPct >= 75 ? '#D97706' : '#DC2626'}
                                        strokeWidth="8"
                                        strokeDasharray={`${2 * Math.PI * 36 * attPct / 100} ${2 * Math.PI * 36}`}
                                        strokeLinecap="round"
                                        transform="rotate(-90 44 44)" />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{attPct}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <cfg.icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{cfg.label}</span>
                                    </div>
                                    <span style={{ fontWeight: 700, color: cfg.color, fontSize: '0.875rem' }}>
                                        {attendance?.[key] || 0}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Finance Summary */}
                    <div className="card p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="h-4 w-4" style={{ color: '#059669' }} />
                            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>الوضع المالي</h3>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'إجمالي الرسوم', amount: totalFees, color: 'var(--text-primary)' },
                                { label: 'المدفوع', amount: paidFees, color: '#059669' },
                                { label: 'المعلق', amount: pendingFees, color: '#D97706' },
                                { label: 'المتأخر', amount: overdueFees, color: '#DC2626' },
                            ].map(row => (
                                <div key={row.label} className="flex justify-between items-center py-1.5" style={{ borderBottom: '1px solid #F9FAFB' }}>
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{row.label}</span>
                                    <span style={{ fontWeight: 700, color: row.color, fontSize: '0.875rem' }}>
                                        ${row.amount.toFixed(0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Finance Records */}
                <div className="lg:col-span-2">
                    <div className="card overflow-hidden">
                        <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <BookOpen className="h-4 w-4" style={{ color: 'var(--blue-primary)' }} />
                            <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>سجل المدفوعات</h3>
                        </div>
                        {finance.length === 0 ? (
                            <div className="py-16 text-center" style={{ color: 'var(--text-muted)' }}>لا توجد سجلات مالية</div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>الوصف</th>
                                        <th>المبلغ</th>
                                        <th>تاريخ الاستحقاق</th>
                                        <th>الحالة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {finance.map((record: any) => (
                                        <tr key={record.id}>
                                            <td style={{ fontWeight: 500 }}>{record.description || record.type}</td>
                                            <td style={{ fontWeight: 700 }}>${parseFloat(record.amount).toFixed(0)}</td>
                                            <td style={{ color: 'var(--text-muted)' }}>
                                                {record.due_date ? new Date(record.due_date).toLocaleDateString('ar-EG') : '—'}
                                            </td>
                                            <td>
                                                <span className={
                                                    record.status === 'paid' ? 'badge badge-green' :
                                                        record.status === 'overdue' ? 'badge badge-red' : 'badge badge-yellow'
                                                }>
                                                    {record.status === 'paid' ? 'مدفوع' : record.status === 'overdue' ? 'متأخر' : 'معلق'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
