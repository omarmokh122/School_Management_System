'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { createStudent } from './actions'

const GRADES = [
    'الأول الابتدائي', 'الثاني الابتدائي', 'الثالث الابتدائي',
    'الرابع الابتدائي', 'الخامس الابتدائي', 'السادس الابتدائي',
    'السابع المتوسط', 'الثامن المتوسط', 'التاسع المتوسط',
    'العاشر الثانوي', 'الحادي عشر الثانوي', 'الثاني عشر الثانوي'
]

const SECTIONS = ['أ', 'ب', 'ج', 'د', 'هـ']

const inputCls = "mt-1 block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-white"

export function AddStudentModal({ schoolId }: { schoolId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const closeModal = () => { setIsOpen(false); setError('') }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const payload = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email') || null,
            phone: formData.get('phone') || null,
            grade: formData.get('grade') || null,
            section: formData.get('section') || null,
            date_of_birth: formData.get('date_of_birth') || null,
            enrollment_date: formData.get('enrollment_date') || null,
            school_id: schoolId
        }

        try {
            const result = await createStudent(payload)
            if (!result.success) {
                setError(result.error)
            } else {
                router.refresh()
                closeModal()
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء إضافة الطالب')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
                <Plus className="h-4 w-4" />
                إضافة طالب
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden" dir="rtl">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">إضافة طالب جديد</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
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
                                    <input required type="text" name="first_name" className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الأخير *</label>
                                    <input required type="text" name="last_name" className={inputCls} />
                                </div>
                            </div>
                            {/* Grade & Section */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">الصف الدراسي</label>
                                    <select name="grade" className={inputCls}>
                                        <option value="">اختر الصف...</option>
                                        {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">الشعبة</label>
                                    <select name="section" className={inputCls}>
                                        <option value="">اختر الشعبة...</option>
                                        {SECTIONS.map(s => <option key={s} value={s}>شعبة {s}</option>)}
                                    </select>
                                </div>
                            </div>
                            {/* Contact */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                                    <input type="email" name="email" className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف</label>
                                    <input type="text" name="phone" className={inputCls} />
                                </div>
                            </div>
                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الميلاد</label>
                                    <input type="date" name="date_of_birth" className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ التسجيل</label>
                                    <input type="date" name="enrollment_date" className={inputCls} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">إلغاء</button>
                                <button type="submit" disabled={isLoading} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                                    {isLoading ? 'جاري الحفظ...' : 'إضافة الطالب'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
