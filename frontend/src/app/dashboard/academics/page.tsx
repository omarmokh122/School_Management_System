import { BookOpen, Upload, BrainCircuit, Users, FileText, CheckCircle2, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect } from "next/navigation"
import { AddClassModal } from "./AddClassModal"
import { EnrollStudentsModal } from "./EnrollStudentsModal"

const SUBJECT_COLORS: Record<string, string> = {
    'الرياضيات': 'bg-blue-50 text-blue-700 border-blue-100',
    'اللغة العربية': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'اللغة الإنجليزية': 'bg-violet-50 text-violet-700 border-violet-100',
    'العلوم': 'bg-amber-50 text-amber-700 border-amber-100',
    'الفيزياء': 'bg-sky-50 text-sky-700 border-sky-100',
    'الكيمياء': 'bg-pink-50 text-pink-700 border-pink-100',
    'التاريخ': 'bg-orange-50 text-orange-700 border-orange-100',
    'الحاسوب والتكنولوجيا': 'bg-indigo-50 text-indigo-700 border-indigo-100',
}

const getSubjectColor = (subject?: string) => SUBJECT_COLORS[subject || ''] || 'bg-slate-100 text-slate-600 border-slate-200'

export default async function AcademicsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const userRole = user?.user_metadata?.role || "Teacher"
    const schoolId = user?.user_metadata?.school_id || '00000000-0000-0000-0000-000000000000'
    let classes: any[] = [], teachers: any[] = [], allStudents: any[] = []

    try {
        if (userRole === "Admin" || userRole === "SuperAdmin") {
            classes = await fetchApi('/academic/classes/matrix') || []
            teachers = await fetchApi('/teachers/') || []
            allStudents = await fetchApi('/students/') || []
        } else {
            classes = await fetchApi(`/academic/classes/teacher/${user.id}`) || []
        }
    } catch (e: any) {
        console.error("Academics error:", e?.message || e)
    }

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
        <div className="space-y-6 page-enter">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">البوابة الأكاديمية</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{classes.length} فصل دراسي — {allStudents.length} طالب</p>
                </div>
                {(userRole === "Admin" || userRole === "SuperAdmin") && (
                    <AddClassModal schoolId={schoolId} teachers={teachers} />
                )}
            </div>

            {/* Class Cards */}
            {classes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                        <BookOpen className="h-7 w-7 text-blue-500" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">لا توجد فصول دراسية بعد</p>
                    <p className="text-xs text-slate-400 mt-1">ابدأ بإنشاء فصل دراسي جديد</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {classes.map((cls) => {
                        const enrolledCount = enrollmentMap[cls.id]?.length ?? cls.students_count ?? 0
                        const subjectColor = getSubjectColor(cls.subject)
                        return (
                            <div key={cls.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all p-5 flex flex-col gap-4">
                                {/* Card Head */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-slate-900 truncate">{cls.name}</h3>
                                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                                            {cls.teacher_name || 'بدون معلم'}
                                        </p>
                                    </div>
                                    {cls.subject && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${subjectColor}`}>
                                            {cls.subject}
                                        </span>
                                    )}
                                </div>

                                {/* Stats row */}
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Users className="h-3.5 w-3.5 text-slate-400" />
                                        <span>{enrolledCount} طالب</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-0">
                                    {(userRole === "Admin" || userRole === "SuperAdmin") ? (
                                        <EnrollStudentsModal
                                            classId={cls.id}
                                            className={cls.name}
                                            schoolId={schoolId}
                                            allStudents={allStudents}
                                            enrolledStudentIds={enrollmentMap[cls.id] || []}
                                        />
                                    ) : (
                                        <button className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 py-2 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors">
                                            <Users className="h-3.5 w-3.5" /> قائمة الطلاب
                                        </button>
                                    )}
                                    <button className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors">
                                        <Upload className="h-3.5 w-3.5" /> المنهج
                                    </button>
                                </div>
                                <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200">
                                    <BrainCircuit className="h-3.5 w-3.5" /> توليد اختبار بالذكاء الاصطناعي
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Bottom Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Upload Curriculum */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Upload className="h-4 w-4 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">رفع المناهج والملفات</h3>
                    </div>
                    <div className="flex justify-center rounded-xl border-2 border-dashed border-slate-200 p-8 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer transition-colors">
                        <div className="text-center">
                            <FileText className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                            <p className="text-sm text-slate-500 font-medium">ارفع ملفات المنهج</p>
                            <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XLSX (أقصى 10MB)</p>
                        </div>
                    </div>
                </div>

                {/* AI Quiz */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="h-8 w-8 rounded-xl bg-violet-50 flex items-center justify-center">
                            <BrainCircuit className="h-4 w-4 text-violet-600" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">إعدادات صانع الاختبارات</h3>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-medium text-slate-600 block mb-1">نوع التقييم</label>
                            <select className="input-base text-sm">
                                <option>اختبار قصير</option>
                                <option>امتحان نصفي</option>
                                <option>امتحان نهائي</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-600 block mb-1">منهجية الأسئلة</label>
                            <select className="input-base text-sm">
                                <option>اختيار من متعدد</option>
                                <option>أسئلة مقالية</option>
                                <option>مختلط</option>
                            </select>
                        </div>
                        <button className="w-full flex justify-center items-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors">
                            <CheckCircle2 className="h-4 w-4" /> توليد الاختبار
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
