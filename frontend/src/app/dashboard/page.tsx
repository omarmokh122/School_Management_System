import { Users, GraduationCap, Wallet, BookOpen, TrendingUp, TrendingDown, ArrowUpRight, Calendar, CheckCircle2, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    let students: any[] = [], teachers: any[] = [], finances: any[] = [], classes: any[] = []

    try {
        students = await fetchApi('/students/') || []
        teachers = await fetchApi('/teachers/') || []
        finances = await fetchApi('/finance/') || []
        classes = await fetchApi('/academic/classes/matrix') || []
    } catch { }

    const totalRevenue = finances.filter(f => f.type === 'payment').reduce((s, f) => s + parseFloat(f.amount || 0), 0)
    const pendingAmount = finances.filter(f => f.status === 'pending').reduce((s, f) => s + parseFloat(f.amount || 0), 0)
    const overdueCount = finances.filter(f => f.status === 'overdue').length

    const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

    const stats = [
        {
            name: 'إجمالي الطلاب',
            value: students.length.toLocaleString('ar'),
            sub: `${classes.length} فصل دراسي`,
            icon: Users,
            bg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            trend: '+8% هذا الشهر',
            up: true,
        },
        {
            name: 'أعضاء الهيئة التدريسية',
            value: teachers.length.toLocaleString('ar'),
            sub: 'معلم نشط',
            icon: GraduationCap,
            bg: 'bg-violet-50',
            iconColor: 'text-violet-600',
            trend: '+2 هذا الفصل',
            up: true,
        },
        {
            name: 'إجمالي الإيرادات',
            value: `$${totalRevenue.toLocaleString('en', { minimumFractionDigits: 0 })}`,
            sub: `${finances.filter(f => f.status === 'paid').length} سجل مدفوع`,
            icon: Wallet,
            bg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            trend: pendingAmount > 0 ? `$${pendingAmount.toLocaleString('en')} قيد الانتظار` : 'لا توجد مبالغ معلقة',
            up: pendingAmount === 0,
        },
        {
            name: 'الفصول الدراسية',
            value: classes.length.toLocaleString('ar'),
            sub: `${overdueCount} متأخرات`,
            icon: BookOpen,
            bg: 'bg-amber-50',
            iconColor: 'text-amber-600',
            trend: overdueCount === 0 ? 'لا توجد متأخرات' : `${overdueCount} فاتورة متأخرة`,
            up: overdueCount === 0,
        },
    ]

    return (
        <div className="space-y-6 page-enter">
            {/* Welcome Header */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-400 mb-1">{today}</p>
                    <h1 className="text-2xl font-bold text-slate-900">مرحباً بك في منصة المدرسة 👋</h1>
                    <p className="text-sm text-slate-500 mt-1">إليك ملخص شامل لحالة المدرسة اليوم</p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span>إدارة المدرسة</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-blue-100 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                                <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                            </div>
                            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${item.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                {item.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{item.name}</p>
                        <p className={`text-xs mt-2 font-medium ${item.up ? 'text-emerald-600' : 'text-red-500'}`}>{item.trend}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Teachers */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800">المعلمون المسجلون</h3>
                        <a href="/dashboard/teachers" className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                            عرض الكل <ArrowUpRight className="h-3 w-3" />
                        </a>
                    </div>
                    {teachers.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-sm">لا يوجد معلمون مسجلون بعد</div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {teachers.slice(0, 5).map((teacher: any, i: number) => (
                                <div key={teacher.id || i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/70 transition-colors">
                                    <div className="h-9 w-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold flex-shrink-0">
                                        {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">{teacher.first_name} {teacher.last_name}</p>
                                        <p className="text-xs text-slate-400 truncate">{teacher.specialization || 'بدون تخصص'}</p>
                                    </div>
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium border border-blue-100 flex-shrink-0">
                                        معلم
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Stats / Recent Students */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800">آخر الطلاب المسجلين</h3>
                        <a href="/dashboard/students" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                            الكل <ArrowUpRight className="h-3 w-3" />
                        </a>
                    </div>
                    {students.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">لا يوجد طلاب بعد</div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {students.slice(-5).reverse().map((student: any, i: number) => (
                                <div key={student.id || i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/70 transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0">
                                        {student.first_name?.[0]}{student.last_name?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-slate-900">{student.first_name} {student.last_name}</p>
                                        <p className="text-[10px] text-slate-400">{student.grade || '—'} {student.section ? `| شعبة ${student.section}` : ''}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Finance Summary + Classes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Finance */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-800">ملخص مالي</h3>
                        <a href="/dashboard/finance" className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700">
                            التفاصيل <ArrowUpRight className="h-3 w-3" />
                        </a>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                <span className="text-xs font-medium text-emerald-700">إجمالي المدفوعات</span>
                            </div>
                            <span className="text-sm font-bold text-emerald-700">${totalRevenue.toLocaleString('en')}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-600" />
                                <span className="text-xs font-medium text-yellow-700">قيد الانتظار</span>
                            </div>
                            <span className="text-sm font-bold text-yellow-700">${pendingAmount.toLocaleString('en')}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-red-50 border border-red-100">
                            <div className="flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                <span className="text-xs font-medium text-red-600">متأخرات</span>
                            </div>
                            <span className="text-sm font-bold text-red-600">{overdueCount} سجل</span>
                        </div>
                    </div>
                </div>

                {/* Classes */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800">الفصول الدراسية</h3>
                        <a href="/dashboard/academics" className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700">
                            إدارة <ArrowUpRight className="h-3 w-3" />
                        </a>
                    </div>
                    {classes.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-sm">لا توجد فصول بعد</div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {classes.slice(0, 5).map((cls: any, i: number) => (
                                <div key={cls.id || i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/70 transition-colors">
                                    <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">{cls.name}</p>
                                        <p className="text-xs text-slate-400">{cls.subject || 'بدون مادة'} • {cls.teacher_name || 'بدون معلم'}</p>
                                    </div>
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium flex-shrink-0">
                                        {cls.students_count || 0} طالب
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
