'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { createClass } from './actions'

const SUBJECTS = [
    'الرياضيات', 'اللغة العربية', 'اللغة الإنجليزية', 'اللغة الفرنسية',
    'العلوم', 'الفيزياء', 'الكيمياء', 'الأحياء',
    'التاريخ', 'الجغرافيا', 'التربية الدينية', 'التربية الوطنية',
    'الحاسوب والتكنولوجيا', 'التربية الفنية', 'التربية الرياضية', 'أخرى'
]

const GRADES = [
    'الأول الابتدائي', 'الثاني الابتدائي', 'الثالث الابتدائي',
    'الرابع الابتدائي', 'الخامس الابتدائي', 'السادس الابتدائي',
    'السابع المتوسط', 'الثامن المتوسط', 'التاسع المتوسط',
    'العاشر الثانوي', 'الحادي عشر الثانوي', 'الثاني عشر الثانوي'
]

const SECTIONS = ['أ', 'ب', 'ج', 'د', 'هـ']

export function AddClassModal({ schoolId, teachers }: { schoolId: string, teachers: any[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const grade = formData.get('grade') as string
        const section = formData.get('section') as string
        const subject = formData.get('subject') as string

        const payload = {
            name: `${grade} - ${section}`.trim(),
            subject: subject || null,
            teacher_id: formData.get('teacher_id'),
            school_id: schoolId
        }

        try {
            const result = await createClass(payload)
            if (!result.success) {
                setError(result.error)
            } else {
                router.refresh()
                setIsOpen(false)
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء إضافة الفصل')
        } finally {
            setIsLoading(false)
        }
    }

    const inputCls = "mt-1 block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-white"

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
                <Plus className="h-4 w-4" />
                إضافة فصل
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" dir="rtl">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-slate-900">إنشاء فصل دراسي</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Grade */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700">الصف الدراسي *</label>
                                <select required name="grade" className={inputCls}>
                                    <option value="">اختر الصف...</option>
                                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            {/* Section */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700">الشعبة *</label>
                                <select required name="section" className={inputCls}>
                                    <option value="">اختر الشعبة...</option>
                                    {SECTIONS.map(s => <option key={s} value={s}>شعبة {s}</option>)}
                                </select>
                            </div>
                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700">المادة الدراسية</label>
                                <select name="subject" className={inputCls}>
                                    <option value="">اختر المادة...</option>
                                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            {/* Teacher */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700">المعلم المسؤول *</label>
                                <select required name="teacher_id" className={inputCls}>
                                    <option value="">اختر المعلم...</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.first_name} {t.last_name} — {t.specialization || 'بدون تخصص'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-5 flex justify-end gap-3 border-t border-slate-100 pt-4">
                                <button type="button" onClick={() => setIsOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                    إلغاء
                                </button>
                                <button type="submit" disabled={isLoading} className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
                                    {isLoading ? 'جاري الحفظ...' : 'إنشاء الفصل'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
