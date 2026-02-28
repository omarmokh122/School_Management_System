'use client'

import { useState } from 'react'
import { Plus, Trash2, Megaphone, AlertTriangle, Bell } from 'lucide-react'
import { createAnnouncement, deleteAnnouncement } from '../actions'

const AUDIENCE_OPTS = [
    { value: 'all', label: 'الجميع' },
    { value: 'teachers', label: 'المعلمون' },
    { value: 'students', label: 'الطلاب' },
    { value: 'parents', label: 'أولياء الأمور' },
]
const AUDIENCE_BADGE: Record<string, string> = {
    all: 'badge badge-blue', teachers: 'badge badge-violet', students: 'badge badge-green', parents: 'badge badge-yellow',
}
const AUDIENCE_LABEL: Record<string, string> = {
    all: 'الجميع', teachers: 'المعلمون', students: 'الطلاب', parents: 'أولياء الأمور',
}

interface Props { schoolId: string; authorId: string; initialAnnouncements: any[] }

export function AnnouncementsClient({ schoolId, authorId, initialAnnouncements }: Props) {
    const [announcements, setAnnouncements] = useState(initialAnnouncements)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ title: '', body: '', audience: 'all', priority: 'normal', expires_at: '' })
    const [saving, setSaving] = useState(false)

    const handleCreate = async () => {
        if (!form.title || !form.body) return
        setSaving(true)
        const res = await createAnnouncement({
            school_id: schoolId,
            author_id: authorId,
            ...form,
            expires_at: form.expires_at || null,
        })
        if (res.success) {
            // Optimistic refresh
            setAnnouncements(prev => [{
                id: res.data?.id,
                ...form,
                created_at: new Date().toISOString(),
            }, ...prev])
            setShowModal(false)
            setForm({ title: '', body: '', audience: 'all', priority: 'normal', expires_at: '' })
        }
        setSaving(false)
    }

    const handleDelete = async (id: string) => {
        await deleteAnnouncement(id)
        setAnnouncements(prev => prev.filter(a => a.id !== id))
    }

    return (
        <div className="space-y-5 page-enter">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="section-title">الإعلانات</h1>
                    <p className="section-sub">{announcements.length} إعلان نشط</p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <Plus className="h-4 w-4" /> إعلان جديد
                </button>
            </div>

            {announcements.length === 0 ? (
                <div className="card py-20 text-center">
                    <Megaphone className="h-12 w-12 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>لا توجد إعلانات بعد</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 4 }}>انشر إعلاناً ليصل لجميع المعنيين</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {announcements.map((ann: any) => (
                        <div key={ann.id} className="card p-5" style={ann.priority === 'urgent' ? { borderRight: '4px solid #EF4444' } : {}}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1">
                                    <div
                                        className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: ann.priority === 'urgent' ? '#FEF2F2' : '#EFF6FF' }}
                                    >
                                        {ann.priority === 'urgent'
                                            ? <AlertTriangle className="h-5 w-5" style={{ color: '#EF4444' }} />
                                            : <Bell className="h-5 w-5" style={{ color: 'var(--blue-primary)' }} />
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{ann.title}</p>
                                            {ann.priority === 'urgent' && (
                                                <span className="badge badge-red">عاجل</span>
                                            )}
                                            <span className={AUDIENCE_BADGE[ann.audience] || 'badge badge-slate'}>
                                                {AUDIENCE_LABEL[ann.audience] || ann.audience}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{ann.body}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)' }}>
                                                {ann.created_at ? new Date(ann.created_at).toLocaleDateString('ar-EG') : ''}
                                            </span>
                                            {ann.expires_at && (
                                                <span style={{ fontSize: '0.6875rem', color: '#D97706' }}>
                                                    ينتهي: {ann.expires_at}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(ann.id)} style={{ color: '#9CA3AF', flexShrink: 0 }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#EF4444'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9CA3AF'}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box max-w-lg" dir="rtl" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">إنشاء إعلان جديد</h3>
                            <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}>✕</button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div>
                                <label className="form-label">عنوان الإعلان *</label>
                                <input className="form-input" placeholder="عنوان واضح ومختصر" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                            </div>
                            <div>
                                <label className="form-label">نص الإعلان *</label>
                                <textarea
                                    className="form-input"
                                    rows={4}
                                    placeholder="اكتب تفاصيل الإعلان هنا..."
                                    value={form.body}
                                    onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">الجمهور المستهدف</label>
                                    <select className="form-input" value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}>
                                        {AUDIENCE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">الأولوية</label>
                                    <select className="form-input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                                        <option value="normal">عادي</option>
                                        <option value="urgent">عاجل 🔴</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="form-label">تاريخ الانتهاء (اختياري)</label>
                                <input type="date" className="form-input" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>إلغاء</button>
                            <button className="btn-primary" onClick={handleCreate} disabled={saving || !form.title || !form.body}>
                                {saving ? 'جاري النشر...' : 'نشر الإعلان'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
