'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, X, CheckSquare, Square } from 'lucide-react'
import { enrollStudents } from './actions'

interface Student {
    id: string
    first_name: string
    last_name: string
    grade?: string
    section?: string
}

interface Props {
    classId: string
    className: string
    schoolId: string
    allStudents: Student[]
    enrolledStudentIds: string[]
}

export function EnrollStudentsModal({ classId, className, schoolId, allStudents, enrolledStudentIds }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [selected, setSelected] = useState<Set<string>>(new Set(enrolledStudentIds))
    const router = useRouter()

    const toggleStudent = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handleSave = async () => {
        setIsLoading(true)
        setError('')
        try {
            // Only enroll newly selected (not already enrolled)
            const newEnrollments = [...selected].filter(id => !enrolledStudentIds.includes(id))
            if (newEnrollments.length === 0) {
                setIsOpen(false)
                setIsLoading(false)
                return
            }
            const result = await enrollStudents({
                class_id: classId,
                student_ids: newEnrollments,
                school_id: schoolId
            })
            if (!result.success) {
                setError(result.error)
            } else {
                router.refresh()
                setIsOpen(false)
            }
        } catch (err: any) {
            setError(err.message || 'خطأ أثناء تسجيل الطلاب')
        } finally {
            setIsLoading(false)
        }
    }

    const unenrolledStudents = allStudents.filter(s => !enrolledStudentIds.includes(s.id))

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
            >
                <Users className="h-3.5 w-3.5" />
                تسجيل طلاب ({enrolledStudentIds.length})
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-slate-200" dir="rtl">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <div>
                                <h3 className="text-base font-bold text-slate-900">تسجيل طلاب في الفصل</h3>
                                <p className="text-sm text-slate-500 mt-0.5">{className}</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="mx-5 mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="p-5 space-y-2 max-h-72 overflow-y-auto">
                            {/* Already enrolled */}
                            {enrolledStudentIds.length > 0 && (
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">مسجلون حالياً ({enrolledStudentIds.length})</p>
                            )}
                            {allStudents.filter(s => enrolledStudentIds.includes(s.id)).map(student => (
                                <div key={student.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-indigo-50 border border-indigo-100">
                                    <CheckSquare className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                                    <span className="text-sm font-medium text-slate-800">{student.first_name} {student.last_name}</span>
                                    <span className="text-xs text-slate-400 mr-auto">{student.grade} {student.section}</span>
                                </div>
                            ))}

                            {/* Unenrolled students to add */}
                            {unenrolledStudents.length > 0 && (
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-3 mb-2">إضافة طلاب</p>
                            )}
                            {unenrolledStudents.length === 0 && enrolledStudentIds.length === 0 && (
                                <p className="text-center text-sm text-slate-400 py-4">لا يوجد طلاب مسجلون في النظام بعد.</p>
                            )}
                            {unenrolledStudents.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => toggleStudent(student.id)}
                                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-colors text-right ${selected.has(student.id) && !enrolledStudentIds.includes(student.id)
                                            ? 'bg-indigo-50 border-indigo-200'
                                            : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50'
                                        }`}
                                >
                                    {selected.has(student.id) && !enrolledStudentIds.includes(student.id)
                                        ? <CheckSquare className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                                        : <Square className="h-4 w-4 text-slate-300 flex-shrink-0" />
                                    }
                                    <span className="text-sm font-medium text-slate-800">{student.first_name} {student.last_name}</span>
                                    <span className="text-xs text-slate-400 mr-auto">{student.grade} {student.section}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end gap-3 p-5 border-t border-slate-100">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'جاري الحفظ...' : 'حفظ التسجيلات'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
