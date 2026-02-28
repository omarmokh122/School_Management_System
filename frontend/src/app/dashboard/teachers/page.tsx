import { Mail, Phone } from "lucide-react"
import { fetchApi } from "@/lib/fetchApi"
import { createClient } from "@/lib/supabase/server"
import { AddTeacherModal } from "./AddTeacherModal"
import { TeacherEditModal } from "./TeacherEditModal"
import { redirect } from "next/navigation"

export default async function TeachersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const schoolId = user?.user_metadata?.school_id || '00000000-0000-0000-0000-000000000000'
    let teachers = []

    try {
        teachers = await fetchApi('/teachers/') || []
    } catch (e: any) {
        console.error("Failed to load teachers:", e?.message || e)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">المعلمون</h2>
                    <p className="text-sm text-slate-500 mt-0.5">إدارة الطاقم التدريسي في المدرسة</p>
                </div>
                <AddTeacherModal schoolId={schoolId} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {teachers.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-slate-400">
                        <div className="text-5xl mb-3">👨‍🏫</div>
                        <p className="text-sm">لا يوجد معلمون مسجلون بعد.</p>
                    </div>
                ) : null}
                {teachers.map((teacher: any) => (
                    <div key={teacher.id} className="relative flex flex-col rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all">
                        {/* Edit button */}
                        <div className="absolute top-4 left-4">
                            <TeacherEditModal teacher={teacher} />
                        </div>

                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-3 pb-4 border-b border-slate-100">
                            {teacher.avatar_url ? (
                                <img
                                    src={teacher.avatar_url}
                                    alt={`${teacher.first_name} ${teacher.last_name}`}
                                    className="h-20 w-20 rounded-full object-cover border-2 border-blue-100 shadow-sm"
                                />
                            ) : (
                                <div className="h-20 w-20 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
                                    {teacher.first_name?.[0] || '؟'}{teacher.last_name?.[0] || ''}
                                </div>
                            )}
                            <div className="text-center">
                                <h3 className="text-base font-semibold text-slate-900">{teacher.first_name} {teacher.last_name}</h3>
                                <span className="mt-1 inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                    {teacher.specialization || 'بدون تخصص'}
                                </span>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="flex-1 pt-3 space-y-2">
                            {teacher.email && (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Mail className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{teacher.email}</span>
                                </div>
                            )}
                            {teacher.phone && (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                    <span>{teacher.phone}</span>
                                </div>
                            )}
                            {!teacher.email && !teacher.phone && (
                                <p className="text-xs text-slate-400 text-center py-2">لا توجد بيانات تواصل</p>
                            )}
                        </div>

                        {/* Footer */}
                        {teacher.hire_date && (
                            <div className="mt-3 pt-3 border-t border-slate-100 text-center">
                                <span className="text-xs text-slate-400">تعيين {teacher.hire_date.split('-')[0]}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
