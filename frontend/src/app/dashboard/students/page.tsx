import { Search } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect } from "next/navigation"
import { AddStudentModal } from "./AddStudentModal"
import { StudentEditModal } from "./StudentEditModal"

export default async function StudentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const schoolId = user?.user_metadata?.school_id || '00000000-0000-0000-0000-000000000000'
    let students = []

    try {
        students = await fetchApi('/students/') || []
    } catch (e: any) {
        console.error("Failed to load students:", e?.message || e)
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">الطلاب</h2>
                    <p className="text-sm text-slate-500 mt-0.5">إدارة سجلات الطلاب — {students.length} طالب مسجل</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                        تصدير
                    </button>
                    <AddStudentModal schoolId={schoolId} />
                </div>
            </div>

            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                {/* Search bar */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="البحث..."
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-9 pl-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-right text-sm">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="py-3 pr-4 pl-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">الطالب</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">الصف</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">الشعبة</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">البريد الإلكتروني</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">الهاتف</th>
                                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">تاريخ التسجيل</th>
                                <th className="relative py-3 pl-4 pr-3"><span className="sr-only">إجراءات</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-14 text-slate-400">
                                        <div className="text-4xl mb-2">👨‍🎓</div>
                                        <p className="text-sm">لا يوجد طلاب مسجلون حتى الآن.</p>
                                    </td>
                                </tr>
                            ) : null}
                            {students.map((student: any) => (
                                <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="whitespace-nowrap py-3 pr-4 pl-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 flex-shrink-0">
                                                {student.first_name?.[0]}{student.last_name?.[0]}
                                            </div>
                                            <span className="font-medium text-slate-900">{student.first_name} {student.last_name}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">{student.grade || '—'}</td>
                                    <td className="whitespace-nowrap px-3 py-3">
                                        {student.section ? (
                                            <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{student.section}</span>
                                        ) : '—'}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">{student.email || '—'}</td>
                                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">{student.phone || '—'}</td>
                                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">{student.enrollment_date || '—'}</td>
                                    <td className="whitespace-nowrap py-3 pl-4 pr-3 text-left">
                                        <StudentEditModal student={student} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
