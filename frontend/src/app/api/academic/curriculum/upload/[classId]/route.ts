import { NextRequest, NextResponse } from 'next/server'
import { fetchApi } from '@/lib/fetchApi'

export async function POST(req: NextRequest, { params }: { params: { classId: string } }) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

        // Re-build FormData to forward to backend
        const backendForm = new FormData()
        backendForm.append('file', file, file.name)

        // fetchApi uses JSON, so we call backend directly with fetch + token
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()

        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'
        const res = await fetch(`${backendUrl}/academic/curriculum/upload/${params.classId}`, {
            method: 'POST',
            headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
            body: backendForm,
        })
        const data = await res.json()
        if (!res.ok) return NextResponse.json(data, { status: res.status })
        return NextResponse.json(data)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
