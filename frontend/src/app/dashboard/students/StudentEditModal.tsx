'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X } from 'lucide-react'
import { updateStudent } from './actions'

const GRADES = [
    'الأول الابتدائي', 'الثاني الابتدائي', 'الثالث الابتدائي',
    'الرابع الابتدائي', 'الخامس الابتدائي', 'السادس الابتدائي',
    'السابع المتوسط', 'الثامن المتوسط', 'التاسع المتوسط',
    'العاشر الثانوي', 'الحادي عشر الثانوي', 'الثاني عشر الثانوي'
]

const SECTIONS = ['أ', 'ب', 'ج', 'د', 'هـ']

const inputCls = "mt-1 block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-white"

interface Student {
    id: string
    first_name: string
    last_name: string
    grade?: string
    section?: string
    email?: string
    phone?: string
    date_of_birth?: string
    enrollment_date?: string
}

export function StudentEditModal({ student }: { student: Student }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const payload = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            grade: formData.get('grade') || null,
            section: formData.get('section') || null,
            email: formData.get('email') || null,
            phone: formData.get('phone') || null,
            date_of_birth: formData.get('date_of_birth') || null,
            enrollment_date: formData.get('enrollment_date') || null,
        }

        try {
            const result = await updateStudent(student.id, payload)
            if (!result.success) {
                setError(result.error)
            } else {
                router.refresh()
                setIsOpen(false)
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء التعديل')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="تعديل"
            >
                <Pencil className="h-3.5 w-3.5" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden" dir="rtl">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">تعديل بيانات الطالب</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>
                            )}
                            {/* Name */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الأول *</label>
                                    <input required type="text" name="first_name" defaultValue={student.first_name} className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الأخير *</label>
                                    <input required type="text" name="last_name" defaultValue={student.last_name} className={inputCls} />
                                </div>
                            </div>
                            {/* Grade & Section */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">الصف الدراسي</label>
                                    <select name="grade" defaultValue={student.grade || ''} className={inputCls}>
                                        <option value="">اختر الصف...</option>
                                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">الشعبة</label>
                                    <select name="section" defaultValue={student.section || ''} className={inputCls}>
                                        <option value="">اختر الشعبة...</option>
                                        {SECTIONS.map(s => <option key={s} value={s}>شعبة {s}</option>)}
                                    </select>
                                </div>
                            </div>
                            {/* Contact */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                                    <input type="email" name="email" defaultValue={student.email || ''} className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف</label>
                                    <input type="text" name="phone" defaultValue={student.phone || ''} className={inputCls} />
                                </div>
                            </div>
                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الميلاد</label>
                                    <input type="date" name="date_of_birth" defaultValue={student.date_of_birth || ''} className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ التسجيل</label>
                                    <input type="date" name="enrollment_date" defaultValue={student.enrollment_date || ''} className={inputCls} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50">إلغاء</button>
                                <button type="submit" disabled={isLoading} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {isLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
