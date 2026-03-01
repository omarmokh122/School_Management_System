import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminAITools } from "./AdminAITools"
import { Sparkles } from "lucide-react"

export default async function AdminToolsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    const role = user?.user_metadata?.role || "Teacher"
    if (!["Admin", "SuperAdmin"].includes(role)) redirect('/dashboard')

    return (
        <div className="space-y-6 page-enter">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0056D2, #7C3AED)' }}>
                    <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="section-title">أدوات الذكاء الاصطناعي الإدارية</h1>
                    <p className="section-sub">صياغة المراسلات، إعداد التقارير، وتوليد الوثائق الرسمية</p>
                </div>
            </div>
            <AdminAITools />
        </div>
    )
}
