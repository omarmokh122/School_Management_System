import { Sparkles, CalendarClock, MessageSquareText, PenTool } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ManagerToolsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const userRole = user?.user_metadata?.role || "Teacher"
    if (userRole !== "Admin" && userRole !== "SuperAdmin") {
        redirect('/dashboard')
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-indigo-600" />
                    أدوات الذكاء الاصطناعي للمدير
                </h2>
                <p className="mt-2 text-sm text-slate-500 max-w-2xl border-r-4 border-indigo-200 pr-4">
                    مرحباً بك في لوحة تحكم الإدارة الذكية. هنا يمكنك استخدام قدرات الذكاء الاصطناعي لتخطيط الجداول الدراسية المعقدة بضغطة زر، وصياغة الرسائل الرسمية الموجهة للمعلمين والطلاب بشكل احترافي.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Schedule Generator */}
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-violet-50/50 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-violet-100 rounded-xl">
                            <CalendarClock className="h-6 w-6 text-violet-700" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">مولّد الجداول الذكي</h3>
                    </div>

                    <form className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">المواد الدراسية (مفصولة بفاصلة)</label>
                            <input
                                type="text"
                                placeholder="رياضيات، علوم، لغة عربية، تاريخ..."
                                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm px-4 py-3"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">أقصى عدد حصص باليوم</label>
                                <input
                                    type="number"
                                    defaultValue={6}
                                    className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm px-4 py-3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">أيام الدوام بالأسبوع</label>
                                <input
                                    type="number"
                                    defaultValue={5}
                                    className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm px-4 py-3"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">قيود إضافية (اختياري)</label>
                            <textarea
                                rows={3}
                                placeholder="مثال: يفضل أن تكون حصص الرياضيات في الصباح، ولا تضع حصة الألعاب في نهاية اليوم."
                                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-sm px-4 py-3"
                            />
                        </div>
                        <button type="button" className="w-full flex justify-center items-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 transition-all">
                            <Sparkles className="h-4 w-4" />
                            توليد الجدول الآن
                        </button>
                    </form>
                </div>

                {/* AI Message Drafter */}
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50/50 p-6 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <MessageSquareText className="h-6 w-6 text-blue-700" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">صياغة المراسلات الإدارية</h3>
                    </div>

                    <form className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">موضوع الرسالة</label>
                            <input
                                type="text"
                                placeholder="تذكير بموعد الامتحانات النصفية..."
                                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">الجمهور المستهدف</label>
                                <select className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3">
                                    <option>أولياء الأمور</option>
                                    <option>الطلاب</option>
                                    <option>الهيئة التدريسية</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">نبرة الرسالة</label>
                                <select className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3">
                                    <option>رسمية جداً</option>
                                    <option>ودية وتشجيعية</option>
                                    <option>عاجلة وهامة</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">سياق تفصيلي</label>
                            <textarea
                                rows={3}
                                placeholder="الامتحانات تبدأ يوم الأحد القادم. يُرجى التذكير بأهمية إحضار الأقلام الجافة ومنع اصطحاب الهواتف المحمولة."
                                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
                            />
                        </div>
                        <button type="button" className="w-full flex justify-center items-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all">
                            <PenTool className="h-4 w-4" />
                            اكتب لي المسودة
                        </button>
                    </form>
                </div>
            </div>

            {/* AI Output Placeholder Area */}
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-slate-50/50">
                <Sparkles className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-600">منطقة عرض النتائج</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
                    عندما تطلب من الذكاء الاصطناعي توليد جدول أو صياغة رسالة، ستظهر النتيجة الاحترافية هنا لتتمكن من تفقدها، تعديلها، ونسخها مباشرة.
                </p>
            </div>
        </div>
    )
}
