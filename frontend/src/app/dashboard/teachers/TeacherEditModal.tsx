'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X, Camera } from 'lucide-react'

const inputCls = "mt-1 block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-white"

interface Teacher {
    id: string
    first_name: string
    last_name: string
    email?: string
    phone?: string
    specialization: string
    hire_date?: string
    avatar_url?: string
}

async function updateTeacher(id: string, payload: any) {
    const res = await fetch(`/api/teachers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Error updating teacher')
    }
    return res.json()
}

export function TeacherEditModal({ teacher }: { teacher: Teacher }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [avatarPreview, setAvatarPreview] = useState(teacher.avatar_url || '')
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
            avatar_url: formData.get('avatar_url') || null,
        }

        try {
            const { fetchApi } = await import('@/lib/fetchApi')
            await fetchApi(`/teachers/${teacher.id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            })
            router.refresh()
            setIsOpen(false)
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="تعديل الملف الشخصي"
            >
                <Pencil className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden" dir="rtl">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">تعديل بيانات المعلم</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>
                            )}

                            {/* Avatar preview + URL */}
                            <div className="flex flex-col items-center gap-3 pb-4 border-b border-slate-100">
                                <div className="relative">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="avatar" className="h-20 w-20 rounded-full object-cover border-2 border-blue-100 shadow" />
                                    ) : (
                                        <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
                                            {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                                        <Camera className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">رابط الصورة (URL)</label>
                                    <input
                                        type="url"
                                        name="avatar_url"
                                        defaultValue={teacher.avatar_url || ''}
                                        placeholder="https://..."
                                        onChange={e => setAvatarPreview(e.target.value)}
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            {/* Name */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الأول *</label>
                                    <input required type="text" name="first_name" defaultValue={teacher.first_name} className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">الاسم الأخير *</label>
                                    <input required type="text" name="last_name" defaultValue={teacher.last_name} className={inputCls} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">التخصص *</label>
                                <input required type="text" name="specialization" defaultValue={teacher.specialization} className={inputCls} />
                            </div>

                            {/* Contact */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                                    <input type="email" name="email" defaultValue={teacher.email || ''} className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف</label>
                                    <input type="text" name="phone" defaultValue={teacher.phone || ''} className={inputCls} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ التعيين</label>
                                <input type="date" name="hire_date" defaultValue={teacher.hire_date || ''} className={inputCls} />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50">إلغاء</button>
                                <button type="submit" disabled={isLoading} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
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
