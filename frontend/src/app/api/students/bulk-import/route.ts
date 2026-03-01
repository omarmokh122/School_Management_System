import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'

async function getToken() {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
}

export async function POST(req: NextRequest) {
    const token = await getToken()
    const form = await req.formData()
    const res = await fetch(`${BACKEND}/students/bulk-import`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
}

export async function GET() {
    const token = await getToken()
    const res = await fetch(`${BACKEND}/students/bulk-import/template`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const blob = await res.blob()
    return new NextResponse(blob, {
        status: res.status,
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="students_template.csv"',
        },
    })
}
