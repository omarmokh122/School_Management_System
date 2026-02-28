import { BookOpen, Upload, BrainCircuit, Users, FileText, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect } from "next/navigation"
import { AddClassModal } from "./AddClassModal"
import { EnrollStudentsModal } from "./EnrollStudentsModal"

export default async function AcademicsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const userRole = user?.user_metadata?.role || "Teacher"
    const schoolId = user?.user_metadata?.school_id || '00000000-0000-0000-0000-000000000000'
    let classes: any[] = []
    let teachers: any[] = []
    let allStudents: any[] = []

    try {
        if (userRole === "Admin" || userRole === "SuperAdmin") {
            classes = await fetchApi('/academic/classes/matrix') || []
            teachers = await fetchApi('/teachers/') || []
            allStudents = await fetchApi('/students/') || []
        } else {
            classes = await fetchApi(`/academic/classes/teacher/${user.id}`) || []
        }
    } catch (e: any) {
        console.error("Failed to fetch academics data:", e?.message || e)
    }

    // Fetch enrolled student IDs for each class (Admin only)
    let enrollmentMap: Record<string, string[]> = {}
    if (userRole === "Admin" || userRole === "SuperAdmin") {
        await Promise.all(
            classes.map(async (cls: any) => {
                try {
                    const enrolled = await fetchApi(`/academic/enrollments/${cls.id}`) || []
                    enrollmentMap[cls.id] = enrolled.map((s: any) => s.id)
                } catch {
                    enrollmentMap[cls.id] = []
                }
            })
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">البوابة الأكاديمية</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        إدارة الفصول، رفع المناهج، وتوليد الاختبارات بالذكاء الاصطناعي.
                    </p>
                </div>
                {(userRole === "Admin" || userRole === "SuperAdmin") && (
                    <div className="flex items-center gap-3">
                        <AddClassModal schoolId={schoolId} teachers={teachers} />
                    </div>
                )}
            </div>

            {/* Classes Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-3xl">📚</span>
                            <span>لا توجد فصول دراسية متاحة.</span>
                        </div>
                    </div>
                ) : null}
                {classes.map((cls) => (
                    <div key={cls.id} className="relative rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all group">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{cls.name}</h3>
                                {(userRole === "Admin" || userRole === "SuperAdmin") && (
                                    <div className="text-sm font-medium text-indigo-600 mt-1">
                                        المعلم: {cls.teacher_name || 'غير محدد'}
                                    </div>
                                )}
                                <div className="mt-2 flex items-center text-sm text-slate-500 gap-2">
                                    <span className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        {enrollmentMap[cls.id]?.length ?? cls.students_count ?? 0} طالباً
                                    </span>
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-indigo-50 flex flex-shrink-0 items-center justify-center">
                                <BookOpen className="h-5 w-5 text-indigo-600" />
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {(userRole === "Admin" || userRole === "SuperAdmin") ? (
                                <EnrollStudentsModal
                                    classId={cls.id}
                                    className={cls.name}
                                    schoolId={schoolId}
                                    allStudents={allStudents}
                                    enrolledStudentIds={enrollmentMap[cls.id] || []}
                                />
                            ) : (
                                <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors">
                                    <Users className="h-3.5 w-3.5" /> قائمة الطلاب
                                </button>
                            )}
                            <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-colors">
                                <Upload className="h-3.5 w-3.5" /> المنهج الدراسي
                            </button>
                        </div>

                        <button className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:from-violet-500 hover:to-indigo-500 transition-all">
                            <BrainCircuit className="h-3.5 w-3.5" /> توليد اختبار بالذكاء الاصطناعي
                        </button>
                    </div>
                ))}
            </div>

            <hr className="border-slate-200" />

            {/* Curriculum Upload & Assessment Tools Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Upload Curriculum Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <Upload className="h-5 w-5 text-indigo-600" /> رفع المناهج والملفات
                    </h3>
                    <div className="mt-2 flex justify-center rounded-xl border border-dashed border-slate-300 px-6 py-10 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer">
                        <div className="text-center">
                            <FileText className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true" />
                            <div className="mt-4 flex text-sm leading-6 text-slate-600">
                                <label className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-600 focus-within:outline-none hover:text-indigo-500">
                                    <span>ارفع الملفات</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                </label>
                                <p className="pl-1 mr-1">أو اسحب وأفلت هنا</p>
                            </div>
                            <p className="text-xs leading-5 text-slate-500 mt-1">PDF, DOCX, XLSX (أقصى حجم 10MB)</p>
                        </div>
                    </div>
                </div>

                {/* AI Quiz Settings */}
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <BrainCircuit className="h-5 w-5 text-indigo-600" /> إعدادات صانع الاختبارات
                    </h3>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">نوع التقييم</label>
                            <select className="mt-1 block w-full rounded-xl border-0 py-2.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                                <option>اختبار قصير (Quiz)</option>
                                <option>امتحان نصفي (Midterm)</option>
                                <option>امتحان نهائي (Final)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">منهجية الأسئلة</label>
                            <select className="mt-1 block w-full rounded-xl border-0 py-2.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                                <option>اختيار من متعدد (MCQ)</option>
                                <option>أسئلة مقالية قصيرة</option>
                                <option>مختلط</option>
                            </select>
                        </div>
                        <button type="button" className="w-full flex justify-center items-center gap-2 rounded-xl bg-slate-900 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors">
                            <CheckCircle2 className="h-4 w-4" />
                            توليد وحفظ الاختبار
                        </button>
                    </form>
                </div>

            </div>
        </div>
    )
}
