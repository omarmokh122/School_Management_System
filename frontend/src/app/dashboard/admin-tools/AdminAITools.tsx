'use client'

import { useState } from 'react'
import { Mail, FileBarChart, CalendarClock, LayoutList, FileText, Sparkles, Copy, Check, ChevronDown, ChevronUp, Loader2, NotebookPen } from 'lucide-react'

type ToolId = 'email' | 'report' | 'agenda' | 'planning' | 'template'
interface ToolDef { id: ToolId; icon: any; title: string; subtitle: string; color: string; bg: string; fields: FieldDef[] }
interface FieldDef { key: string; label: string; type: 'text' | 'textarea' | 'select' | 'number'; placeholder?: string; options?: string[]; required?: boolean; hint?: string }

const TOOLS: ToolDef[] = [
    {
        id: 'email', icon: Mail, title: 'صياغة المراسلات الرسمية', subtitle: 'بريد إلكتروني احترافي لأي جهة', color: '#0056D2', bg: '#EFF6FF',
        fields: [
            { key: 'email_subject', label: 'موضوع الرسالة *', type: 'text', placeholder: 'مثال: دعوة لاجتماع أولياء الأمور', required: true },
            { key: 'recipient_type', label: 'المستلم', type: 'select', options: ['أولياء الأمور', 'المعلمون', 'وزارة التعليم', 'موردون / شركات', 'إدارة المدرسة', 'جهة خارجية'] },
            { key: 'key_points', label: 'النقاط الأساسية *', type: 'textarea', placeholder: 'اكتب أهم ما يجب أن تتضمنه الرسالة', required: true },
            { key: 'tone', label: 'أسلوب الكتابة', type: 'select', options: ['رسمي', 'ودي ومهني', 'تنبيهي', 'شكر وتقدير', 'تعزيزي'] },
            { key: 'additional_notes', label: 'ملاحظات إضافية', type: 'text', placeholder: 'أي تعليمات إضافية' },
        ]
    },
    {
        id: 'report', icon: FileBarChart, title: 'إعداد التقارير الإدارية', subtitle: 'تقرير شهري منظم وجاهز للرفع', color: '#7C3AED', bg: '#F5F3FF',
        fields: [
            { key: 'report_period', label: 'فترة التقرير *', type: 'text', placeholder: 'مثال: شهر يناير 2025', required: true },
            { key: 'activities', label: 'الأنشطة والمهام المنجزة *', type: 'textarea', placeholder: 'اذكر الأنشطة والمهام التي أُنجزت خلال الفترة', required: true },
            { key: 'achievements', label: 'الإنجازات والنتائج', type: 'textarea', placeholder: 'ما الإنجازات المحققة؟' },
            { key: 'challenges', label: 'التحديات والعقبات', type: 'textarea', placeholder: 'ما التحديات التي واجهت الفريق؟' },
            { key: 'additional_notes', label: 'توصيات للفترة القادمة', type: 'textarea', placeholder: 'أي توصيات أو خطط للمرحلة المقبلة' },
        ]
    },
    {
        id: 'agenda', icon: CalendarClock, title: 'جدول الأعمال ومحاضر الاجتماعات', subtitle: 'أجندة اجتماع أو تحويل ملاحظات لمحضر رسمي', color: '#059669', bg: '#F0FDF4',
        fields: [
            { key: 'meeting_title', label: 'عنوان الاجتماع', type: 'text', placeholder: 'مثال: اجتماع تخطيط الفصل الدراسي الثاني' },
            { key: 'attendees', label: 'الحضور', type: 'text', placeholder: 'مثال: مدير المدرسة، رؤساء الأقسام' },
            { key: 'topics', label: 'محاور النقاش *', type: 'textarea', placeholder: 'اذكر موضوعات الاجتماع الرئيسية', required: true },
            { key: 'duration', label: 'المدة الزمنية', type: 'text', placeholder: 'مثال: 90 دقيقة' },
            { key: 'meeting_notes', label: 'ملاحظات الاجتماع (لإنشاء محضر)', type: 'textarea', placeholder: 'ألصق هنا ملاحظات الاجتماع لتحويلها إلى محضر رسمي (اختياري)', hint: 'إذا أضفت ملاحظات هنا، سيُنشئ الذكاء الاصطناعي محضراً رسمياً بدلاً من جدول أعمال' },
        ]
    },
    {
        id: 'planning', icon: LayoutList, title: 'التخطيط الأسبوعي الإداري', subtitle: 'خطة عمل أسبوعية منظمة للفريق', color: '#D97706', bg: '#FFFBEB',
        fields: [
            { key: 'week_goals', label: 'أهداف الأسبوع *', type: 'textarea', placeholder: 'ما الأهداف التي يجب تحقيقها هذا الأسبوع؟', required: true },
            { key: 'team_size', label: 'عدد أفراد الفريق', type: 'text', placeholder: 'مثال: 5 موظفين' },
            { key: 'constraints', label: 'القيود والملاحظات', type: 'textarea', placeholder: 'إجازات، فعاليات، اجتماعات مجدولة مسبقاً...' },
            { key: 'additional_notes', label: 'تذكيرات مهمة', type: 'text', placeholder: 'أي مواعيد نهائية أو تذكيرات' },
        ]
    },
    {
        id: 'template', icon: FileText, title: 'إنشاء النماذج الرسمية', subtitle: 'نماذج وثائق جاهزة للطباعة', color: '#DC2626', bg: '#FEF2F2',
        fields: [
            { key: 'template_type', label: 'نوع النموذج *', type: 'select', options: ['نموذج إجازة / غياب', 'إذن خروج طالب', 'خطاب تحذير', 'شهادة تقدير', 'نموذج موافقة ولي الأمر', 'خطاب توصية', 'عقد تدريب', 'تعميم داخلي'], required: true },
            { key: 'school_name', label: 'اسم المدرسة', type: 'text', placeholder: 'مثال: مدرسة الأمل الدولية' },
            { key: 'custom_fields', label: 'حقول إضافية مطلوبة', type: 'textarea', placeholder: 'مثال: حقل للسبب، حقل للتاريخ، خانة الموافقة...' },
            { key: 'additional_notes', label: 'ملاحظات', type: 'text', placeholder: 'أي متطلبات خاصة' },
        ]
    },
]

export function AdminAITools() {
    const [activeToolId, setActiveToolId] = useState<ToolId | null>(null)
    const [forms, setForms] = useState<Record<string, Record<string, any>>>({})
    const [results, setResults] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState<Record<string, boolean>>({})
    const [copied, setCopied] = useState<Record<string, boolean>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})

    const setField = (toolId: string, key: string, value: any) =>
        setForms(f => ({ ...f, [toolId]: { ...(f[toolId] || {}), [key]: value } }))

    const handleGenerate = async (tool: ToolDef) => {
        const form = forms[tool.id] || {}
        const missing = tool.fields.filter(f => f.required && !form[f.key]?.toString().trim())
        if (missing.length) {
            setErrors(e => ({ ...e, [tool.id]: `الحقول المطلوبة: ${missing.map(f => f.label.replace(' *', '')).join('، ')}` }))
            return
        }
        setErrors(e => ({ ...e, [tool.id]: '' }))
        setLoading(l => ({ ...l, [tool.id]: true }))
        setResults(r => ({ ...r, [tool.id]: '' }))
        try {
            const res = await fetch('/api/ai/admin-tools', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tool: tool.id, ...form }) })
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" dir="rtl">
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
                                {tool.fields.map(field => (
                                    <div key={field.key}>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>{field.label}</label>
                                        {field.hint && <p style={{ fontSize: '0.6875rem', color: '#0056D2', marginBottom: 4, fontStyle: 'italic' }}>{field.hint}</p>}
                                        {field.type === 'textarea' ? (
                                            <textarea rows={3} className="form-input" style={{ resize: 'vertical', minHeight: 72 }} placeholder={field.placeholder}
                                                value={forms[tool.id]?.[field.key] || ''} onChange={e => setField(tool.id, field.key, e.target.value)} />
                                        ) : field.type === 'select' ? (
                                            <select className="form-input" value={forms[tool.id]?.[field.key] || field.options?.[0] || ''}
                                                onChange={e => setField(tool.id, field.key, e.target.value)}>
                                                {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        ) : (
                                            <input type="text" className="form-input" placeholder={field.placeholder}
                                                value={forms[tool.id]?.[field.key] || ''} onChange={e => setField(tool.id, field.key, e.target.value)} />
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
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: tool.color }}>النتيجة — جاهزة للاستخدام</span>
                                            <button onClick={() => handleCopy(tool.id)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: copied[tool.id] ? '#059669' : tool.color, background: 'none', border: 'none', cursor: 'pointer' }}>
                                                {copied[tool.id] ? <><Check className="h-3.5 w-3.5" /> تم النسخ!</> : <><Copy className="h-3.5 w-3.5" /> نسخ</>}
                                            </button>
                                        </div>
                                        <div style={{ padding: '12px 14px', maxHeight: 400, overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '0.8125rem', lineHeight: 1.8, color: 'var(--text-primary)' }}>
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
    )
}
