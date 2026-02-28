'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { createFinancialRecord } from './actions'

const inputCls = "mt-1 block w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm text-slate-900 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none bg-white"

interface Student { id: string; first_name: string; last_name: string }

export function AddFinancialRecordModal({ schoolId, students }: { schoolId: string; students: Student[] }) {
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
            student_id: formData.get('student_id'),
            amount: parseFloat(formData.get('amount') as string),
            type: formData.get('type'),
            status: formData.get('status') || 'pending',
            due_date: formData.get('due_date'),
            description: formData.get('description') || null,
            school_id: schoolId
        }

        try {
            const result = await createFinancialRecord(payload)
            if (!result.success) {
                setError(result.error)
            } else {
                router.refresh()
                setIsOpen(false)
            }
        } catch (err: any) {
            setError(err.message || 'خطأ')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
                <Plus className="h-4 w-4" />
                إصدار فاتورة
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden" dir="rtl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">إصدار سجل مالي</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                            {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{error}</div>}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">الطالب *</label>
                                <select required name="student_id" className={inputCls}>
                                    <option value="">اختر الطالب...</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">النوع *</label>
                                    <select required name="type" className={inputCls}>
                                        <option value="invoice">فاتورة</option>
                                        <option value="payment">دفعة</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">الحالة</label>
                                    <select name="status" className={inputCls}>
                                        <option value="pending">قيد الانتظار</option>
                                        <option value="paid">مدفوع</option>
                                        <option value="overdue">متأخر</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">المبلغ ($) *</label>
                                    <input required type="number" step="0.01" min="0" name="amount" className={inputCls} placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">تاريخ الاستحقاق *</label>
                                    <input required type="date" name="due_date" className={inputCls} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات</label>
                                <input type="text" name="description" placeholder="رسوم دراسية، نشاط..." className={inputCls} />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50">إلغاء</button>
                                <button type="submit" disabled={isLoading} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                                    {isLoading ? 'جاري الحفظ...' : 'حفظ السجل'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
