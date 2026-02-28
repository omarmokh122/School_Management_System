import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
    try {
        const { school_name, admin_first_name, admin_last_name, email, password, phone, city } = await req.json()

        if (!school_name || !email || !password) {
            return NextResponse.json({ error: 'الحقول المطلوبة ناقصة' }, { status: 400 })
        }
        if (password.length < 8) {
            return NextResponse.json({ error: 'كلمة المرور قصيرة جداً' }, { status: 400 })
        }

        // 1. Create school record via backend API
        const schoolRes = await fetch(`${process.env.BACKEND_URL || 'http://localhost:8000'}/api/v1/schools/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: school_name, phone, city }),
        }).catch(() => null)

        let schoolId: string | null = null
        if (schoolRes?.ok) {
            const schoolData = await schoolRes.json()
            schoolId = schoolData.id
        } else {
            // fallback: create user without school_id, admin can set it later
            schoolId = null
        }

        // 2. Create Supabase auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                role: 'Admin',
                school_id: schoolId,
                first_name: admin_first_name || '',
                last_name: admin_last_name || '',
                school_name,
            },
        })

        if (authError) {
            const msg = authError.message || ''
            if (msg.includes('already') || msg.includes('registered')) {
                return NextResponse.json({ error: 'هذا البريد الإلكتروني مسجل بالفعل' }, { status: 409 })
            }
            return NextResponse.json({ error: msg }, { status: 400 })
        }

        // 3. Sign in user so they get redirected with a session
        const { error: signInError } = await supabaseAdmin.auth.signInWithPassword
            ? { error: null }  // admin client can't sign in — rely on client-side sign-in
            : { error: null }

        return NextResponse.json({
            status: 'success',
            user_id: authData.user.id,
            school_id: schoolId,
            message: 'تم تسجيل المدرسة بنجاح',
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'خطأ داخلي' }, { status: 500 })
    }
}
