'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft, Plus, X } from 'lucide-react'
import { createCalendarEvent, deleteCalendarEvent } from '../actions'

const EVENT_TYPES = [
    { value: 'exam', label: 'امتحان', color: '#EF4444', bg: '#FEF2F2' },
    { value: 'holiday', label: 'إجازة', color: '#059669', bg: '#F0FDF4' },
    { value: 'meeting', label: 'اجتماع', color: '#0056D2', bg: '#EFF6FF' },
    { value: 'activity', label: 'نشاط', color: '#7C3AED', bg: '#F5F3FF' },
]

const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const AR_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

interface Props { schoolId: string; initialEvents: any[]; initialYear: number; initialMonth: number }

export function CalendarView({ schoolId, initialEvents, initialYear, initialMonth }: Props) {
    const [year, setYear] = useState(initialYear)
    const [month, setMonth] = useState(initialMonth)
    const [events, setEvents] = useState(initialEvents)
    const [showModal, setShowModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState('')
    const [form, setForm] = useState({ title: '', description: '', event_type: 'activity', start_date: '', end_date: '' })
    const [saving, setSaving] = useState(false)

    const daysInMonth = new Date(year, month, 0).getDate()
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay()
    const today = new Date().toISOString().split('T')[0]

    const getEventsForDate = (dateStr: string) =>
        events.filter(e => e.start_date <= dateStr && e.end_date >= dateStr)

    const navigate = async (dir: 1 | -1) => {
        let newMonth = month + dir
        let newYear = year
        if (newMonth > 12) { newMonth = 1; newYear++ }
        if (newMonth < 1) { newMonth = 12; newYear-- }
        setMonth(newMonth)
        setYear(newYear)
        try {
            const res = await fetch(`/api/calendar-events?year=${newYear}&month=${newMonth}`)
            const data = await res.json()
            setEvents(data || [])
        } catch { }
    }

    const handleCreate = async () => {
        if (!form.title || !form.start_date) return
        setSaving(true)
        const res = await createCalendarEvent({
            school_id: schoolId,
            ...form,
            end_date: form.end_date || form.start_date,
        })
        if (res.success) {
            setEvents(prev => [...prev, { id: res.data?.id, ...form, end_date: form.end_date || form.start_date }])
            setShowModal(false)
            setForm({ title: '', description: '', event_type: 'activity', start_date: '', end_date: '' })
        }
        setSaving(false)
    }

    const handleDeleteEvent = async (eventId: string) => {
        await deleteCalendarEvent(eventId)
        setEvents(prev => prev.filter(e => e.id !== eventId))
    }

    const openModal = (dateStr: string) => {
        setSelectedDate(dateStr)
        setForm(f => ({ ...f, start_date: dateStr, end_date: dateStr }))
        setShowModal(true)
    }

    const cells: (number | null)[] = [
        ...Array(firstDayOfWeek).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]

    return (
        <div className="space-y-5 page-enter">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="section-title">التقويم المدرسي</h1>
                    <p className="section-sub">{AR_MONTHS[month - 1]} {year}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-secondary" onClick={() => navigate(-1)}>
                        <ChevronRight className="h-4 w-4" />
                    </button>
                    <button className="btn-secondary" onClick={() => navigate(1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button className="btn-primary" onClick={() => openModal(today)}>
                        <Plus className="h-4 w-4" /> إضافة حدث
                    </button>
                </div>
            </div>

            {/* Event type legend */}
            <div className="flex flex-wrap gap-3">
                {EVENT_TYPES.map(t => (
                    <span key={t.value} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: t.color }}>
                        <span className="h-3 w-3 rounded-sm" style={{ background: t.bg, border: `1.5px solid ${t.color}` }} />
                        {t.label}
                    </span>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="card overflow-hidden">
                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '2px solid #E5E7EB' }}>
                    {AR_DAYS.map(d => (
                        <div key={d} style={{ padding: '0.625rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', borderLeft: '1px solid #F3F4F6' }}>
                            {d}
                        </div>
                    ))}
                </div>
                {/* Day cells */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
                    {cells.map((day, i) => {
                        if (!day) return <div key={`empty-${i}`} style={{ minHeight: 100, borderLeft: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', background: '#FAFAFA' }} />
                        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        const dayEvents = getEventsForDate(dateStr)
                        const isToday = dateStr === today
                        return (
                            <div
                                key={day}
                                style={{
                                    minHeight: 100,
                                    borderLeft: '1px solid #F3F4F6',
                                    borderBottom: '1px solid #F3F4F6',
                                    padding: '0.375rem',
                                    cursor: 'pointer',
                                    background: isToday ? '#EFF6FF' : 'white',
                                    transition: 'background .1s',
                                }}
                                onClick={() => openModal(dateStr)}
                                onMouseEnter={e => { if (!isToday) (e.currentTarget as HTMLElement).style.background = '#F9FAFB' }}
                                onMouseLeave={e => { if (!isToday) (e.currentTarget as HTMLElement).style.background = 'white' }}
                            >
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    width: 26, height: 26, borderRadius: '50%',
                                    fontSize: '0.8125rem', fontWeight: isToday ? 800 : 500,
                                    background: isToday ? 'var(--blue-primary)' : 'transparent',
                                    color: isToday ? 'white' : 'var(--text-primary)',
                                    marginBottom: '0.25rem',
                                }}>
                                    {day}
                                </div>
                                <div className="space-y-0.5">
                                    {dayEvents.slice(0, 3).map(ev => {
                                        const t = EVENT_TYPES.find(t => t.value === ev.event_type) || EVENT_TYPES[3]
                                        return (
                                            <div
                                                key={ev.id}
                                                className="flex items-center justify-between group"
                                                style={{
                                                    background: t.bg,
                                                    borderRadius: 4,
                                                    padding: '1px 6px',
                                                    fontSize: '0.6875rem',
                                                    fontWeight: 600,
                                                    color: t.color,
                                                    border: `1px solid ${t.color}30`,
                                                }}
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <span className="truncate">{ev.title}</span>
                                                <button
                                                    onClick={() => handleDeleteEvent(ev.id)}
                                                    className="opacity-0 group-hover:opacity-100 flex-shrink-0"
                                                    style={{ color: t.color }}
                                                >
                                                    <X className="h-2.5 w-2.5" />
                                                </button>
                                            </div>
                                        )
                                    })}
                                    {dayEvents.length > 3 && (
                                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)', padding: '1px 4px' }}>+{dayEvents.length - 3} more</div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Add Event Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box max-w-md" dir="rtl" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">إضافة حدث — {selectedDate}</h3>
                            <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div>
                                <label className="form-label">عنوان الحدث *</label>
                                <input className="form-input" placeholder="مثال: امتحان الرياضيات" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                            </div>
                            <div>
                                <label className="form-label">نوع الحدث</label>
                                <select className="form-input" value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))}>
                                    {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">تاريخ البداية</label>
                                    <input type="date" className="form-input" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="form-label">تاريخ النهاية</label>
                                    <input type="date" className="form-input" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">وصف (اختياري)</label>
                                <textarea className="form-input" rows={2} placeholder="تفاصيل إضافية..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'none' }} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>إلغاء</button>
                            <button className="btn-primary" onClick={handleCreate} disabled={saving || !form.title || !form.start_date}>
                                {saving ? 'جاري الحفظ...' : 'إضافة الحدث'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
