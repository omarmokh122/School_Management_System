import { Mail, Phone } from "lucide-react"
import { fetchApi } from "@/lib/fetchApi"
import { createClient } from "@/lib/supabase/server"
import { AddTeacherModal } from "./AddTeacherModal"
import { redirect } from "next/navigation"

export default async function TeachersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

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
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">إدارة المعلمين</h2>
                    <p className="text-sm text-slate-500 mt-1">عرض وإدارة الطاقم التدريسي وتوزيع الحصص.</p>
                </div>
                <div className="flex items-center gap-3">
                    <AddTeacherModal schoolId={schoolId} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {teachers.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl">👨‍🏫</span>
                            <span>لا يوجد معلمون مسجلون حتى الآن.</span>
                        </div>
                    </div>
                ) : null}
                {teachers.map((teacher: any) => (
                    <div key={teacher.id} className="relative flex flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-indigo-200">
                        {/* Avatar with initials */}
                        <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-700 text-xl font-bold shadow-inner">
                            {teacher.first_name?.[0] || '؟'}{teacher.last_name?.[0] || ''}
                        </div>
                        {/* Name & Specialization */}
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-slate-900">
                                {teacher.first_name} {teacher.last_name}
                            </h3>
                            <p className="text-sm font-medium text-indigo-600 mt-1">{teacher.specialization || 'غير محدد'}</p>
                        </div>
                        {/* Contact Info */}
                        <div className="w-full space-y-2 border-t border-slate-100 pt-4">
                            {teacher.email && (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span className="truncate">{teacher.email}</span>
                                </div>
                            )}
                            {teacher.phone && (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                    <span>{teacher.phone}</span>
                                </div>
                            )}
                        </div>
                        {/* Hire year footer */}
                        <div className="w-full border-t border-slate-100 pt-3 flex justify-between text-center">
                            <div>
                                <span className="block text-sm font-semibold text-slate-900">{teacher.hire_date ? teacher.hire_date.split("-")[0] : '—'}</span>
                                <span className="text-xs text-slate-500">سنة التعيين</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
