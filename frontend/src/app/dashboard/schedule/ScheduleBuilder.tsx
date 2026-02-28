'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Calendar, Clock } from 'lucide-react'
import { addScheduleSlot, deleteScheduleSlot } from '../actions'

const DAYS = [
    { key: 'Sunday', label: 'الأحد' },
    { key: 'Monday', label: 'الاثنين' },
    { key: 'Tuesday', label: 'الثلاثاء' },
    { key: 'Wednesday', label: 'الأربعاء' },
    { key: 'Thursday', label: 'الخميس' },
]

const PERIODS = [
    { num: 1, time: '07:30–08:15' }, { num: 2, time: '08:15–09:00' },
    { num: 3, time: '09:00–09:45' }, { num: 4, time: '09:45–10:30' },
    { num: 5, time: '10:45–11:30' }, { num: 6, time: '11:30–12:15' },
    { num: 7, time: '12:15–13:00' }, { num: 8, time: '13:00–13:45' },
]

const SUBJECT_COLORS: Record<string, string> = {
    'الرياضيات': '#DBEAFE', 'اللغة العربية': '#D1FAE5', 'اللغة الإنجليزية': '#EDE9FE',
    'العلوم': '#FEF3C7', 'الفيزياء': '#E0F2FE', 'الكيمياء': '#FCE7F3',
    'التاريخ': '#FED7AA', 'الحاسوب والتكنولوجيا': '#E0E7FF',
}

interface Props {
    schoolId: string
    initialSlots: any[]
    classes: any[]
    teachers: any[]
}

export function ScheduleBuilder({ schoolId, initialSlots, classes, teachers }: Props) {
    const router = useRouter()
    const [slots, setSlots] = useState<any[]>(initialSlots)
    const [adding, setAdding] = useState<{ day: string; period: number } | null>(null)
    const [form, setForm] = useState({ class_id: '', teacher_id: '', room: '' })
    const [loading, setLoading] = useState(false)

    const getSlot = (day: string, period: number) =>
        slots.find(s => s.day_of_week === day && s.period === period)

    const handleAdd = async () => {
        if (!adding || !form.class_id || !form.teacher_id) return
        setLoading(true)
        const res = await addScheduleSlot({
            school_id: schoolId,
            class_id: form.class_id,
            teacher_id: form.teacher_id,
            day_of_week: adding.day,
            period: adding.period,
            room: form.room || null,
        })
        if (res.success) {
            router.refresh()
            setAdding(null)
            setForm({ class_id: '', teacher_id: '', room: '' })
        }
        setLoading(false)
    }

    const handleDelete = async (slotId: string) => {
        await deleteScheduleSlot(slotId)
        setSlots(prev => prev.filter(s => s.id !== slotId))
    }

    return (
        <div className="space-y-5 page-enter">
            <div>
                <h1 className="section-title">الجدول الدراسي الأسبوعي</h1>
                <p className="section-sub">انقر على أي خلية لإضافة حصة دراسية</p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 items-center">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>المواد:</span>
                {Object.entries(SUBJECT_COLORS).slice(0, 6).map(([subj, color]) => (
                    <span key={subj} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span className="h-3 w-3 rounded-sm inline-block" style={{ background: color, border: '1px solid #E5E7EB' }} />
                        {subj}
                    </span>
                ))}
            </div>

            {/* Grid */}
            <div className="card overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #E5E7EB' }}>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', width: 80 }}>الحصة</th>
                            {DAYS.map(d => (
                                <th key={d.key} style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                    {d.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PERIODS.map(period => (
                            <tr key={period.num} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                <td style={{ padding: '0.75rem 1rem', verticalAlign: 'middle' }}>
                                    <div>
                                        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>الحصة {period.num}</p>
                                        <p style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)' }}>{period.time}</p>
                                    </div>
                                </td>
                                {DAYS.map(day => {
                                    const slot = getSlot(day.key, period.num)
                                    const bg = slot?.subject ? SUBJECT_COLORS[slot.subject] || '#F3F4F6' : undefined
                                    return (
                                        <td key={day.key} style={{ padding: '0.5rem', verticalAlign: 'middle', textAlign: 'center' }}>
                                            {slot ? (
                                                <div
                                                    className="group relative"
                                                    style={{
                                                        background: bg || '#F9FAFB',
                                                        border: '1px solid #E5E7EB',
                                                        borderRadius: 8,
                                                        padding: '0.5rem 0.625rem',
                                                        minHeight: 68,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <button
                                                        onClick={() => handleDelete(slot.id)}
                                                        className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        style={{ color: '#EF4444' }}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{slot.class_name}</p>
                                                    {slot.subject && <p style={{ fontSize: '0.6875rem', color: '#6B7280', marginTop: 2 }}>{slot.subject}</p>}
                                                    <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', marginTop: 1 }}>{slot.teacher_name?.split(' ').slice(0, 2).join(' ')}</p>
                                                    {slot.room && <p style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>🏛 {slot.room}</p>}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setAdding({ day: day.key, period: period.num }); setForm({ class_id: '', teacher_id: '', room: '' }) }}
                                                    style={{
                                                        width: '100%', minHeight: 68, border: '1.5px dashed #E5E7EB', borderRadius: 8,
                                                        background: 'transparent', cursor: 'pointer', color: '#D1D5DB', transition: 'all .15s',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}
                                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--blue-primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--blue-primary)'; (e.currentTarget as HTMLElement).style.background = '#EFF6FF' }}
                                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLElement).style.color = '#D1D5DB'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Slot Modal */}
            {adding && (
                <div className="modal-overlay" onClick={() => setAdding(null)}>
                    <div className="modal-box max-w-sm" dir="rtl" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">إضافة حصة — {DAYS.find(d => d.key === adding.day)?.label} / الحصة {adding.period}</h3>
                            <button onClick={() => setAdding(null)} style={{ color: 'var(--text-muted)' }}>✕</button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div>
                                <label className="form-label">الفصل الدراسي *</label>
                                <select className="form-input" value={form.class_id} onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))}>
                                    <option value="">اختر الفصل...</option>
                                    {classes.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}{c.subject ? ` — ${c.subject}` : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">المعلم *</label>
                                <select className="form-input" value={form.teacher_id} onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}>
                                    <option value="">اختر المعلم...</option>
                                    {teachers.map((t: any) => (
                                        <option key={t.id} value={t.id}>{t.first_name} {t.last_name} — {t.specialization}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">رقم القاعة (اختياري)</label>
                                <input className="form-input" placeholder="مثال: A101" value={form.room} onChange={e => setForm(f => ({ ...f, room: e.target.value }))} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setAdding(null)}>إلغاء</button>
                            <button className="btn-primary" onClick={handleAdd} disabled={loading || !form.class_id || !form.teacher_id}>
                                {loading ? 'جاري الإضافة...' : 'إضافة الحصة'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
