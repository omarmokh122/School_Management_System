import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TeacherAITools } from "./TeacherAITools"
import { BrainCircuit } from "lucide-react"

export default async function TeacherToolsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const role = user?.user_metadata?.role || "Teacher"
    // Not accessible to students
    if (role === "Student") redirect('/dashboard')

    return (
        <div className="space-y-6 page-enter">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #0056D2)' }}>
                    <BrainCircuit className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="section-title">أدوات الذكاء الاصطناعي للمعلم</h1>
                    <p className="section-sub">أدوات ذكية لتوفير وقتك وتحسين جودة التعليم</p>
                </div>
            </div>
            <TeacherAITools />
        </div>
    )
}
