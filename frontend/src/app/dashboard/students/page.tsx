import { Plus, Search, MoreVertical } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect } from "next/navigation"
import { AddStudentModal } from "./AddStudentModal"

export default async function StudentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const schoolId = user?.user_metadata?.school_id || '00000000-0000-0000-0000-000000000000'
    let students = []

    try {
        students = await fetchApi('/students/') || []
    } catch (e: any) {
        console.error("Failed to load students:", e?.message || e)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">إدارة الطلاب</h2>
                    <p className="text-sm text-slate-500 mt-1">عرض وإدارة سجلات الطلاب في النظام.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                        تصدير
                    </button>
                    <AddStudentModal schoolId={schoolId} />
                </div>
            </div>

            {/* Table Section */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="البحث بالاسم أو الصف..."
                            className="w-full rounded-lg border-0 bg-white py-2 pr-10 pl-4 text-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                        />
                    </div>
                    <span className="text-sm text-slate-500">{students.length} طالب</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-right text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="py-3.5 pr-4 pl-3 font-semibold text-slate-900 sm:pr-6">الاسم</th>
                                <th scope="col" className="px-3 py-3.5 font-semibold text-slate-900">الصف</th>
                                <th scope="col" className="px-3 py-3.5 font-semibold text-slate-900">الشعبة</th>
                                <th scope="col" className="px-3 py-3.5 font-semibold text-slate-900">البريد الإلكتروني</th>
                                <th scope="col" className="px-3 py-3.5 font-semibold text-slate-900">الهاتف</th>
                                <th scope="col" className="px-3 py-3.5 font-semibold text-slate-900">تاريخ التسجيل</th>
                                <th scope="col" className="relative py-3.5 pl-4 pr-3 sm:pl-6"><span className="sr-only">إجراءات</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl">👨‍🎓</span>
                                            <span>لا يوجد طلاب مسجلين حتى الآن.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : null}
                            {students.map((student: any) => (
                                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="whitespace-nowrap py-4 pr-4 pl-3 sm:pr-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                                {student.first_name?.[0]}{student.last_name?.[0]}
                                            </div>
                                            <span className="font-medium text-slate-900">{student.first_name} {student.last_name}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-slate-500">{student.grade || '—'}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-slate-500">{student.section || '—'}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-slate-500">{student.email || '—'}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-slate-500">{student.phone || '—'}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-slate-500">{student.enrollment_date || '—'}</td>
                                    <td className="relative whitespace-nowrap py-4 pl-4 pr-3 text-left sm:pl-6">
                                        <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
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
