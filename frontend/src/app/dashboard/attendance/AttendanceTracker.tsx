'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, XCircle, Clock, AlertCircle, Save, Users } from 'lucide-react'
import { submitAttendance } from '../actions'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = [
    { value: 'present', label: 'حاضر', icon: CheckCircle2, color: '#059669', bg: '#F0FDF4' },
    { value: 'absent', label: 'غائب', icon: XCircle, color: '#DC2626', bg: '#FEF2F2' },
    { value: 'late', label: 'متأخر', icon: Clock, color: '#D97706', bg: '#FFFBEB' },
    { value: 'excused', label: 'معذور', icon: AlertCircle, color: '#7C3AED', bg: '#F5F3FF' },
]

interface Props { schoolId: string; teacherId: string | null; classes: any[] }

export function AttendanceTracker({ schoolId, teacherId, classes }: Props) {
    const router = useRouter()
    const today = new Date().toISOString().split('T')[0]

    const [selectedClassId, setSelectedClassId] = useState('')
    const [date, setDate] = useState(today)
    const [students, setStudents] = useState<any[]>([])
    const [attendance, setAttendance] = useState<Record<string, string>>({})
    const [notes, setNotes] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Load enrolled students when class changes
    useEffect(() => {
        if (!selectedClassId) { setStudents([]); return }
        setLoading(true)
        fetch(`/api/attendance-students?class_id=${selectedClassId}`)
            .then(r => r.json())
            .then(data => {
                setStudents(data || [])
                // Default everyone to present
                const def: Record<string, string> = {}
                    ; (data || []).forEach((s: any) => { def[s.id] = 'present' })
                setAttendance(def)
                setNotes({})
            })
            .catch(() => setStudents([]))
            .finally(() => setLoading(false))
    }, [selectedClassId])

    const setStatus = (studentId: string, status: string) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }))
    }

    const handleSave = async () => {
        if (!selectedClassId || students.length === 0) return
        setSaving(true)
        setSaved(false)
        const records = students.map(s => ({
            student_id: s.id,
            status: attendance[s.id] || 'present',
            notes: notes[s.id] || null,
        }))
        const res = await submitAttendance({
            school_id: schoolId,
            class_id: selectedClassId,
            teacher_id: teacherId,
            date,
            records,
        })
        if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
        setSaving(false)
    }

    const summary = {
        present: Object.values(attendance).filter(s => s === 'present').length,
        absent: Object.values(attendance).filter(s => s === 'absent').length,
        late: Object.values(attendance).filter(s => s === 'late').length,
        excused: Object.values(attendance).filter(s => s === 'excused').length,
    }

    return (
        <div className="space-y-5 page-enter">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="section-title">الحضور والغياب</h1>
                    <p className="section-sub">تسجيل الحضور اليومي بشكل جماعي</p>
                </div>
                {students.length > 0 && (
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                        style={saved ? { background: '#059669' } : {}}
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ ✓' : 'حفظ الحضور'}
                    </button>
                )}
            </div>

            {/* Controls */}
            <div className="card p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="form-label">الفصل الدراسي *</label>
                        <select
                            className="form-input"
                            value={selectedClassId}
                            onChange={e => setSelectedClassId(e.target.value)}
                        >
                            <option value="">اختر الفصل...</option>
                            {classes.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}{c.subject ? ` — ${c.subject}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">التاريخ *</label>
                        <input
                            type="date"
                            className="form-input"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            max={today}
                        />
                    </div>
                </div>
            </div>

            {/* Summary Bar */}
            {students.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                    {STATUS_OPTIONS.map(opt => (
                        <div key={opt.value} className="card p-3 text-center" style={{ borderTop: `3px solid ${opt.color}` }}>
                            <p style={{ fontSize: '1.375rem', fontWeight: 800, color: opt.color }}>
                                {summary[opt.value as keyof typeof summary]}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Student List */}
            {!selectedClassId ? (
                <div className="card py-16 text-center">
                    <Users className="h-12 w-12 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', fontWeight: 600 }}>اختر فصلاً لبدء تسجيل الحضور</p>
                </div>
            ) : loading ? (
                <div className="card py-16 text-center" style={{ color: 'var(--text-muted)' }}>جاري التحميل...</div>
            ) : students.length === 0 ? (
                <div className="card py-16 text-center" style={{ color: 'var(--text-muted)' }}>لا يوجد طلاب مسجلون في هذا الفصل</div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>قائمة الطلاب</p>
                        <span className="badge badge-blue">{students.length} طالب</span>
                    </div>
                    <div className="divide-y" style={{ borderColor: '#F9FAFB' }}>
                        {students.map((student: any, i: number) => {
                            const status = attendance[student.id] || 'present'
                            const opt = STATUS_OPTIONS.find(o => o.value === status)!
                            return (
                                <div key={student.id} className="flex items-center gap-4 px-5 py-3">
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600, width: 24 }}>{i + 1}</span>
                                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'var(--blue-primary)' }}>
                                        {student.first_name?.[0]}{student.last_name?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{student.first_name} {student.last_name}</p>
                                        <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{student.grade} {student.section ? `| ${student.section}` : ''}</p>
                                    </div>
                                    {/* Status Buttons */}
                                    <div className="flex gap-1.5">
                                        {STATUS_OPTIONS.map(o => (
                                            <button
                                                key={o.value}
                                                onClick={() => setStatus(student.id, o.value)}
                                                style={{
                                                    padding: '0.3125rem 0.75rem',
                                                    borderRadius: 6,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    border: status === o.value ? `1.5px solid ${o.color}` : '1.5px solid #E5E7EB',
                                                    background: status === o.value ? o.bg : 'white',
                                                    color: status === o.value ? o.color : 'var(--text-muted)',
                                                    cursor: 'pointer',
                                                    transition: 'all .1s',
                                                    fontFamily: 'inherit',
                                                }}
                                            >
                                                {o.label}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Notes */}
                                    <input
                                        type="text"
                                        placeholder="ملاحظة..."
                                        value={notes[student.id] || ''}
                                        onChange={e => setNotes(prev => ({ ...prev, [student.id]: e.target.value }))}
                                        style={{
                                            width: 120, padding: '0.3125rem 0.5rem', borderRadius: 6,
                                            fontSize: '0.75rem', border: '1px solid #E5E7EB', outline: 'none', fontFamily: 'inherit',
                                        }}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
