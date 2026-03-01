'use client'

import { useState } from 'react'
import { BookOpen, FileQuestion, ClipboardList, Mail, Layers, Sparkles, Copy, Check, ChevronDown, ChevronUp, Loader2, BookMarked, AlertCircle } from 'lucide-react'
import { CurriculumUpload } from './CurriculumUpload'

/* ── Types ─────────────────────────────────── */
type ToolId = 'lesson_plan' | 'quiz' | 'student_report' | 'parent_email' | 'differentiate'

interface ClassItem { id: string; name: string; subject?: string }
interface ToolDef { id: ToolId; icon: any; title: string; subtitle: string; color: string; bg: string; fields: FieldDef[] }
interface FieldDef { key: string; label: string; type: 'text' | 'textarea' | 'select' | 'number'; placeholder?: string; options?: string[]; required?: boolean }

/* ── Tool definitions ───────────────────────── */
const TOOLS: ToolDef[] = [
    {
        id: 'lesson_plan', icon: BookOpen, title: 'منشئ خطة الدرس', subtitle: 'خطة درس متكاملة في ثوانٍ', color: '#0056D2', bg: '#EFF6FF',
        fields: [
            { key: 'topic', label: 'موضوع الدرس *', type: 'text', placeholder: 'مثال: الكسور العشرية', required: true },
            { key: 'subject', label: 'المادة الدراسية', type: 'text', placeholder: 'مثال: الرياضيات' },
            { key: 'grade', label: 'الصف الدراسي *', type: 'text', placeholder: 'مثال: الصف الخامس', required: true },
            { key: 'objectives', label: 'الأهداف التعليمية', type: 'textarea', placeholder: 'اتركه فارغاً وسيصيغها الذكاء الاصطناعي' },
            { key: 'additional_notes', label: 'ملاحظات', type: 'text', placeholder: 'أي متطلبات خاصة' },
        ]
    },
    {
        id: 'quiz', icon: FileQuestion, title: 'منشئ الاختبارات', subtitle: 'اختبارات متعددة المستويات', color: '#7C3AED', bg: '#F5F3FF',
        fields: [
            { key: 'topic', label: 'موضوع الاختبار *', type: 'text', placeholder: 'مثال: الفعل المضارع', required: true },
            { key: 'subject', label: 'المادة', type: 'text', placeholder: 'مثال: اللغة العربية' },
            { key: 'grade', label: 'الصف *', type: 'text', placeholder: 'مثال: الصف السابع', required: true },
            { key: 'num_questions', label: 'عدد الأسئلة', type: 'number', placeholder: '10' },
            { key: 'difficulty', label: 'مستوى الصعوبة', type: 'select', options: ['سهل', 'متوسط', 'صعب', 'متعدد المستويات'] },
        ]
    },
    {
        id: 'student_report', icon: ClipboardList, title: 'كاتب تقارير الطلاب', subtitle: 'تقرير احترافي في لحظات', color: '#059669', bg: '#F0FDF4',
        fields: [
            { key: 'student_name', label: 'اسم الطالب *', type: 'text', placeholder: 'مثال: أحمد محمد', required: true },
            { key: 'grade', label: 'الصف', type: 'text', placeholder: 'مثال: الصف الثالث' },
            { key: 'subject', label: 'المادة', type: 'text', placeholder: 'مثال: العلوم' },
            { key: 'strengths', label: 'نقاط القوة', type: 'textarea', placeholder: 'ما الذي يتقنه الطالب؟' },
            { key: 'areas_to_improve', label: 'مجالات التطوير', type: 'textarea', placeholder: 'ما الذي يحتاج تحسيناً؟' },
        ]
    },
    {
        id: 'parent_email', icon: Mail, title: 'محرر رسائل أولياء الأمور', subtitle: 'رسائل مهنية لأولياء الأمور', color: '#D97706', bg: '#FFFBEB',
        fields: [
            { key: 'student_name', label: 'اسم الطالب *', type: 'text', placeholder: 'مثال: سارة أحمد', required: true },
            { key: 'parent_name', label: 'اسم ولي الأمر', type: 'text', placeholder: 'مثال: الأستاذ أحمد' },
            { key: 'student_issue', label: 'موضوع الرسالة *', type: 'textarea', placeholder: 'مثال: التغيب المتكرر، أو التقدم الملحوظ', required: true },
        ]
    },
    {
        id: 'differentiate', icon: Layers, title: 'محوّل المحتوى المتمايز', subtitle: 'محتوى لمستويات مختلفة', color: '#DC2626', bg: '#FEF2F2',
        fields: [
            { key: 'content', label: 'المحتوى الأصلي *', type: 'textarea', placeholder: 'ألصق هنا نص الدرس', required: true },
            { key: 'grade', label: 'الصف', type: 'text', placeholder: 'مثال: الصف الخامس' },
            { key: 'reading_level', label: 'المستوى المستهدف', type: 'select', options: ['مبسط', 'متوسط', 'متقدم', 'الثلاثة مستويات'] },
        ]
    },
]

/* ── Main component ─────────────────────────── */
export function TeacherAITools({ classes = [] }: { classes?: ClassItem[] }) {
    const [selectedClassId, setSelectedClassId] = useState<string>('')
    const [curriculumContext, setCurriculumContext] = useState<string>('')
    const [curriculumClassName, setCurriculumClassName] = useState<string>('')

    const [activeToolId, setActiveToolId] = useState<ToolId | null>(null)
    const [forms, setForms] = useState<Record<string, Record<string, any>>>({})
    const [results, setResults] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState<Record<string, boolean>>({})
    const [copied, setCopied] = useState<Record<string, boolean>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})

    const selectedClass = classes.find(c => c.id === selectedClassId)
    const setField = (toolId: string, key: string, value: any) =>
        setForms(f => ({ ...f, [toolId]: { ...(f[toolId] || {}), [key]: value } }))

    const handleGenerate = async (tool: ToolDef) => {
        const form = forms[tool.id] || {}
        const missing = tool.fields.filter(f => f.required && !form[f.key]?.toString().trim())
        if (missing.length > 0) {
            setErrors(e => ({ ...e, [tool.id]: `الحقول المطلوبة: ${missing.map(f => f.label.replace(' *', '')).join('، ')}` }))
            return
        }
        setErrors(e => ({ ...e, [tool.id]: '' }))
        setLoading(l => ({ ...l, [tool.id]: true }))
        setResults(r => ({ ...r, [tool.id]: '' }))

        try {
            const payload: any = { tool: tool.id, ...form }
            if (curriculumContext) payload.curriculum_context = curriculumContext
            const res = await fetch('/api/ai/teacher-tools', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            const data = await res.json()
            if (!res.ok) setErrors(e => ({ ...e, [tool.id]: data.error || data.detail || 'حدث خطأ' }))
            else setResults(r => ({ ...r, [tool.id]: data.result }))
        } catch { setErrors(e => ({ ...e, [tool.id]: 'تعذر الاتصال بالخادم' })) }
        setLoading(l => ({ ...l, [tool.id]: false }))
    }

    const handleCopy = (toolId: string) => {
        navigator.clipboard.writeText(results[toolId] || '').then(() => {
            setCopied(c => ({ ...c, [toolId]: true }))
            setTimeout(() => setCopied(c => ({ ...c, [toolId]: false })), 2000)
        })
    }

    return (
        <div className="space-y-5" dir="rtl">
            {/* ── Curriculum Context Panel ── */}
            <div className="card p-5" style={{ border: curriculumContext ? '2px solid #059669' : '2px solid #E5E7EB' }}>
                <div className="flex items-center gap-3 mb-4">
                    <BookMarked className="h-5 w-5 flex-shrink-0" style={{ color: curriculumContext ? '#059669' : '#64748b' }} />
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>المنهج الدراسي</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {curriculumContext
                                ? `✅ تم تحميل منهج «${curriculumClassName}» — سيستخدمه الذكاء الاصطناعي في جميع الأدوات`
                                : 'اختر مادة وارفع ملف المنهج لتوليد محتوى مبني عليه'}
                        </p>
                    </div>
                </div>

                {/* Class selector */}
                {classes.length > 0 ? (
                    <div className="space-y-3">
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>اختر المادة / الفصل</label>
                            <select
                                className="form-input"
                                value={selectedClassId}
                                onChange={e => { setSelectedClassId(e.target.value); setCurriculumContext(''); setCurriculumClassName('') }}
                            >
                                <option value="">-- اختر مادة --</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}{c.subject ? ` • ${c.subject}` : ''}</option>
                                ))}
                            </select>
                        </div>

                        {selectedClassId && selectedClass && (
                            <CurriculumUpload
                                classId={selectedClassId}
                                className={selectedClass.name}
                                onCurriculumLoaded={(text, name) => { setCurriculumContext(text); setCurriculumClassName(name) }}
                                onCurriculumCleared={() => { setCurriculumContext(''); setCurriculumClassName('') }}
                            />
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', background: '#FFF7ED', borderRadius: 10, border: '1px solid #FED7AA' }}>
                        <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#D97706' }} />
                        <p style={{ fontSize: '0.8125rem', color: '#92400E' }}>لا توجد مواد مسجّلة. بإمكانك استخدام أدوات الذكاء الاصطناعي بدون منهج مرفوع.</p>
                    </div>
                )}
            </div>

            {/* ── AI Tool Cards ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {TOOLS.map(tool => {
                    const Icon = tool.icon
                    const isActive = activeToolId === tool.id
                    const isLoading = loading[tool.id]
                    const result = results[tool.id]
                    const error = errors[tool.id]

                    return (
                        <div key={tool.id} className="card overflow-hidden flex flex-col"
                            style={{ border: isActive ? `2px solid ${tool.color}` : '2px solid transparent', transition: 'border-color .2s' }}>
                            <button onClick={() => setActiveToolId(isActive ? null : tool.id)}
                                className="flex items-center gap-3 p-5 text-right w-full"
                                style={{ background: isActive ? tool.bg : 'transparent' }}>
                                <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tool.bg }}>
                                    <Icon className="h-5 w-5" style={{ color: tool.color }} />
                                </div>
                                <div className="flex-1">
                                    <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{tool.title}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{tool.subtitle}</p>
                                </div>
                                {isActive ? <ChevronUp className="h-4 w-4" style={{ color: tool.color }} /> : <ChevronDown className="h-4 w-4" style={{ color: 'var(--text-subtle)' }} />}
                            </button>

                            {isActive && (
                                <div className="px-5 pb-5 space-y-3 flex-1 flex flex-col">
                                    {curriculumContext && (
                                        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '6px 12px', fontSize: '0.75rem', color: '#065F46', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <BookMarked className="h-3.5 w-3.5 flex-shrink-0" />
                                            📎 سيُوَلَّد المحتوى بناءً على منهج «{curriculumClassName}»
                                        </div>
                                    )}
                                    {tool.fields.map(field => (
                                        <div key={field.key}>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{field.label}</label>
                                            {field.type === 'textarea' ? (
                                                <textarea rows={3} className="form-input" style={{ resize: 'vertical', minHeight: 72 }} placeholder={field.placeholder} value={forms[tool.id]?.[field.key] || ''} onChange={e => setField(tool.id, field.key, e.target.value)} />
                                            ) : field.type === 'select' ? (
                                                <select className="form-input" value={forms[tool.id]?.[field.key] || field.options?.[1] || ''} onChange={e => setField(tool.id, field.key, e.target.value)}>
                                                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            ) : field.type === 'number' ? (
                                                <input type="number" className="form-input" placeholder={field.placeholder} value={forms[tool.id]?.[field.key] || ''} onChange={e => setField(tool.id, field.key, parseInt(e.target.value) || '')} min={1} max={50} />
                                            ) : (
                                                <input type="text" className="form-input" placeholder={field.placeholder} value={forms[tool.id]?.[field.key] || ''} onChange={e => setField(tool.id, field.key, e.target.value)} />
                                            )}
                                        </div>
                                    ))}

                                    {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', fontSize: '0.8125rem', color: '#DC2626' }}>{error}</div>}

                                    <button onClick={() => handleGenerate(tool)} disabled={isLoading} className="btn-primary w-full mt-1"
                                        style={{ background: tool.color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> جاري التوليد...</> : <><Sparkles className="h-4 w-4" /> توليد بالذكاء الاصطناعي</>}
                                    </button>

                                    {result && (
                                        <div style={{ marginTop: 8, border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: tool.bg, borderBottom: '1px solid #E5E7EB' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: tool.color }}>النتيجة</span>
                                                <button onClick={() => handleCopy(tool.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: copied[tool.id] ? '#059669' : tool.color, background: 'none', border: 'none', cursor: 'pointer' }}>
                                                    {copied[tool.id] ? <><Check className="h-3.5 w-3.5" /> تم النسخ!</> : <><Copy className="h-3.5 w-3.5" /> نسخ</>}
                                                </button>
                                            </div>
                                            <div style={{ padding: '12px 14px', maxHeight: 320, overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '0.8125rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>
                                                {result}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
