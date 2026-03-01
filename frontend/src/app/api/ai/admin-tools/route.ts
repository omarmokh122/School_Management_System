import { NextRequest, NextResponse } from 'next/server'
import { fetchApi } from '@/lib/fetchApi'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const result = await fetchApi('/ai/admin-tools', { method: 'POST', body: JSON.stringify(body) })
        return NextResponse.json(result)
    } catch (e: any) {
        const msg = e?.message || 'خطأ في توليد المحتوى'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
