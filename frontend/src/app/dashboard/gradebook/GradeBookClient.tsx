'use client'

import { useState } from 'react'
import { BookOpen, Save, Check } from 'lucide-react'
import { fetchApi } from '@/lib/fetchApi'

const ASSESSMENT_TYPES = [
    { value: 'quiz', label: 'اختبار قصير' },
    { value: 'midterm', label: 'امتحان نصفي' },
    { value: 'final', label: 'امتحان نهائي' },
    { value: 'assignment', label: 'واجب منزلي' },
    { value: 'project', label: 'مشروع' },
]

const GRADE_LETTER = (score: number, max: number) => {
    const pct = max > 0 ? (score / max) * 100 : 0
    if (pct >= 95) return { letter: 'A+', color: '#059669' }
    if (pct >= 90) return { letter: 'A', color: '#059669' }
    if (pct >= 85) return { letter: 'B+', color: '#0056D2' }
    if (pct >= 80) return { letter: 'B', color: '#0056D2' }
    if (pct >= 75) return { letter: 'C+', color: '#D97706' }
    if (pct >= 70) return { letter: 'C', color: '#D97706' }
    if (pct >= 60) return { letter: 'D', color: '#EA580C' }
    return { letter: 'F', color: '#DC2626' }
}

interface Props { schoolId: string; classes: any[]; userRole: string }

export function GradeBookClient({ schoolId, classes, userRole }: Props) {
    const [selectedClassId, setSelectedClassId] = useState('')
    const [assessmentTitle, setAssessmentTitle] = useState('')
    const [assessmentType, setAssessmentType] = useState('quiz')
    const [maxScore, setMaxScore] = useState(100)
    const [students, setStudents] = useState<any[]>([])
    const [scores, setScores] = useState<Record<string, string>>({})
    const [remarks, setRemarks] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [savedCount, setSavedCount] = useState(0)

    const loadStudents = async (classId: string) => {
        if (!classId) { setStudents([]); return }
        setLoading(true)
        try {
            const enrolled = await fetch(`/api/attendance-students?class_id=${classId}`).then(r => r.json())
            setStudents(enrolled || [])
            setScores({})
            setRemarks({})
        } catch {
            setStudents([])
        }
        setLoading(false)
    }

    const handleSave = async () => {
        if (!selectedClassId || !assessmentTitle || students.length === 0) return
        setSaving(true)

        // 1. Create or get assessment
        let assessmentId: string | null = null
        try {
            const cls = classes.find(c => c.id === selectedClassId)
            const assessRes = await fetch('/api/create-assessment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    school_id: schoolId,
                    class_id: selectedClassId,
                    teacher_id: cls?.teacher_id,
                    type: assessmentType,
                    title: assessmentTitle,
                    max_score: maxScore,
                }),
            })
            const assessData = await assessRes.json()
            assessmentId = assessData.id
        } catch { }

        // 2. Submit grades for each student
        let saved = 0
        for (const student of students) {
            const score = parseFloat(scores[student.id] || '0')
            if (assessmentId && !isNaN(score)) {
                try {
                    await fetch('/api/submit-grade', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            school_id: schoolId,
                            student_id: student.id,
                            assessment_id: assessmentId,
                            score,
                            remarks: remarks[student.id] || null,
                        }),
                    })
                    saved++
                } catch { }
            }
        }
        setSavedCount(saved)
        setSaving(false)
        setTimeout(() => setSavedCount(0), 4000)
    }

    const avgScore = students.length > 0
        ? Object.values(scores).reduce((s, v) => s + (parseFloat(v) || 0), 0) / students.length
        : 0

    return (
        <div className="space-y-5 page-enter">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="section-title">دفتر الدرجات</h1>
                    <p className="section-sub">إدخال وإدارة درجات الطلاب</p>
                </div>
                {students.length > 0 && assessmentTitle && (
                    <button className="btn-primary" onClick={handleSave} disabled={saving}
                        style={savedCount > 0 ? { background: '#059669' } : {}}>
                        {savedCount > 0 ? <><Check className="h-4 w-4" /> تم الحفظ ({savedCount})</> : saving ? 'جاري الحفظ...' : <><Save className="h-4 w-4" /> حفظ الدرجات</>}
                    </button>
                )}
            </div>

            {/* Settings Card */}
            <div className="card p-5">
                <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>إعدادات التقييم</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="form-label">الفصل الدراسي *</label>
                        <select className="form-input" value={selectedClassId} onChange={e => { setSelectedClassId(e.target.value); loadStudents(e.target.value) }}>
                            <option value="">اختر الفصل...</option>
                            {classes.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}{c.subject ? ` — ${c.subject}` : ''}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">نوع التقييم *</label>
                        <select className="form-input" value={assessmentType} onChange={e => setAssessmentType(e.target.value)}>
                            {ASSESSMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="form-label">عنوان التقييم *</label>
                        <input className="form-input" placeholder="مثال: امتحان الفصل الأول" value={assessmentTitle} onChange={e => setAssessmentTitle(e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label">الدرجة القصوى</label>
                        <input type="number" className="form-input" min={1} max={1000} value={maxScore} onChange={e => setMaxScore(parseInt(e.target.value) || 100)} />
                    </div>
                </div>
            </div>

            {/* Stats bar */}
            {students.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="card p-4 text-center">
                        <p style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--blue-primary)' }}>{students.length}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>عدد الطلاب</p>
                    </div>
                    <div className="card p-4 text-center">
                        <p style={{ fontSize: '1.375rem', fontWeight: 800, color: '#059669' }}>{avgScore.toFixed(1)}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>متوسط الدرجة</p>
                    </div>
                    <div className="card p-4 text-center">
                        <p style={{ fontSize: '1.375rem', fontWeight: 800, color: '#7C3AED' }}>{maxScore}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>الدرجة القصوى</p>
                    </div>
                </div>
            )}

            {/* Grade Entry Table */}
            {!selectedClassId ? (
                <div className="card py-20 text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-3" style={{ color: '#D1D5DB' }} />
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9375rem' }}>اختر فصلاً لبدء إدخال الدرجات</p>
                </div>
            ) : loading ? (
                <div className="card py-16 text-center" style={{ color: 'var(--text-muted)' }}>جاري تحميل الطلاب...</div>
            ) : students.length === 0 ? (
                <div className="card py-16 text-center" style={{ color: 'var(--text-muted)' }}>لا يوجد طلاب في هذا الفصل</div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid #F3F4F6' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>إدخال الدرجات</p>
                        <span className="badge badge-blue">{students.length} طالب</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>الطالب</th>
                                    <th>الدرجة (من {maxScore})</th>
                                    <th>التقدير</th>
                                    <th>النسبة %</th>
                                    <th>ملاحظات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s: any, i: number) => {
                                    const scoreVal = parseFloat(scores[s.id] || '0')
                                    const { letter, color } = GRADE_LETTER(scoreVal, maxScore)
                                    const pct = maxScore > 0 ? ((scoreVal / maxScore) * 100).toFixed(1) : '0'
                                    return (
                                        <tr key={s.id}>
                                            <td style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', fontWeight: 600 }}>{i + 1}</td>
                                            <td>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: 'var(--blue-primary)' }}>
                                                        {s.first_name?.[0]}{s.last_name?.[0]}
                                                    </div>
                                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.first_name} {s.last_name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={maxScore}
                                                    placeholder="0"
                                                    value={scores[s.id] || ''}
                                                    onChange={e => setScores(prev => ({ ...prev, [s.id]: e.target.value }))}
                                                    style={{
                                                        width: 80, padding: '0.375rem 0.625rem', borderRadius: 6,
                                                        border: '1.5px solid #E5E7EB', outline: 'none',
                                                        fontSize: '0.875rem', fontFamily: 'inherit', textAlign: 'center',
                                                        fontWeight: 700, color: 'var(--text-primary)',
                                                    }}
                                                    onFocus={e => (e.target as HTMLElement).style.borderColor = 'var(--blue-primary)'}
                                                    onBlur={e => (e.target as HTMLElement).style.borderColor = '#E5E7EB'}
                                                />
                                            </td>
                                            <td>
                                                <span style={{
                                                    fontWeight: 800, fontSize: '0.9375rem', color,
                                                    background: `${color}15`, padding: '2px 10px', borderRadius: 6, border: `1px solid ${color}30`,
                                                }}>{scores[s.id] ? letter : '—'}</span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600 }}>
                                                {scores[s.id] ? `${pct}%` : '—'}
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    placeholder="ملاحظة..."
                                                    value={remarks[s.id] || ''}
                                                    onChange={e => setRemarks(prev => ({ ...prev, [s.id]: e.target.value }))}
                                                    style={{
                                                        width: 150, padding: '0.375rem 0.5rem', borderRadius: 6,
                                                        border: '1px solid #E5E7EB', outline: 'none',
                                                        fontSize: '0.75rem', fontFamily: 'inherit',
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
