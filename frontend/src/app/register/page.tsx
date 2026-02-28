import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SchoolRegisterForm } from "./SchoolRegisterForm"
import Link from "next/link"
import { School } from "lucide-react"

export default async function RegisterPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    // Already logged in → go to dashboard
    if (user) redirect('/dashboard')

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)' }}>
            <div className="w-full max-w-lg" dir="rtl">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'var(--blue-primary)' }}>
                        <School className="h-8 w-8 text-white" />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>إنشاء حساب مدرستك</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 6, textAlign: 'center' }}>
                        ابدأ مجاناً. لا تحتاج بطاقة ائتمانية.
                    </p>
                </div>

                <div className="card p-8">
                    <SchoolRegisterForm />
                </div>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    لديك حساب بالفعل؟{' '}
                    <Link href="/login" style={{ color: 'var(--blue-primary)', fontWeight: 600, textDecoration: 'none' }}>
                        تسجيل الدخول
                    </Link>
                </p>
            </div>
        </div>
    )
}
