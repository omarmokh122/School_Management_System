import { Plus, Search, Mail } from "lucide-react"

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
    } catch (e) {
        console.error("Failed to load teachers:", e)
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
                        لا يوجد معلمون مسجلون حتى الآن.
                    </div>
                ) : null}
                {teachers.map((teacher: any) => (
                    <div key={teacher.id} className="relative flex flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-indigo-200">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-700 text-xl font-bold shadow-inner">
                            م
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-slate-900">معلم مسجل</h3>
                            <p className="text-sm font-medium text-indigo-600 mt-1">{teacher.specialization || 'غير محدد'}</p>
                        </div>
                        <div className="flex w-full justify-between border-t border-slate-100 pt-4 mt-2">
                            <div className="text-center">
                                <span className="block text-sm font-medium text-slate-900 mt-1.5">{teacher.hire_date ? teacher.hire_date.split("-")[0] : '—'}</span>
                                <span className="text-xs text-slate-500">سنة التعيين</span>
                            </div>
                        </div>
                        <button className="absolute top-4 left-4 text-slate-400 hover:text-indigo-600 transition-colors">
                            <Mail className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
