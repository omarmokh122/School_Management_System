'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { createTeacher } from './actions'

export function AddTeacherModal({ schoolId }: { schoolId: string }) {
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
            email: formData.get('email') || null,
            phone: formData.get('phone') || null,
            specialization: formData.get('specialization'),
            hire_date: formData.get('hire_date') || null,
            school_id: schoolId
        }

        try {
            const result = await createTeacher(payload)
            if (!result.success) {
                setError(result.error)
            } else {
                router.refresh()
                setIsOpen(false)
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ أثناء إضافة المعلم')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
                <Plus className="h-4 w-4" />
                إضافة معلم
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-slate-900">إضافة معلم جديد</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">الاسم الأول (إلزامي)</label>
                                    <input
                                        required
                                        type="text"
                                        name="first_name"
                                        className="mt-1 block w-full rounded-xl border-0 py-2.5 pl-3 pr-4 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">الاسم الأخير (إلزامي)</label>
                                    <input
                                        required
                                        type="text"
                                        name="last_name"
                                        className="mt-1 block w-full rounded-xl border-0 py-2.5 pl-3 pr-4 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="mt-1 block w-full rounded-xl border-0 py-2.5 pl-3 pr-4 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">رقم الهاتف</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        className="mt-1 block w-full rounded-xl border-0 py-2.5 pl-3 pr-4 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">التخصص (إلزامي)</label>
                                <input
                                    required
                                    type="text"
                                    name="specialization"
                                    placeholder="مثال: الرياضيات، العلوم..."
                                    className="mt-1 block w-full rounded-xl border-0 py-2.5 pl-3 pr-4 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">تاريخ التعيين</label>
                                <input
                                    type="date"
                                    name="hire_date"
                                    className="mt-1 block w-full rounded-xl border-0 py-2.5 pl-3 pr-4 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'جاري الإضافة...' : 'حفظ المعلم'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
