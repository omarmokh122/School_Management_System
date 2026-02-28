import { NextRequest, NextResponse } from 'next/server'
import { fetchApi } from '@/lib/fetchApi'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const body = await req.json()
        const result = await fetchApi(`/teachers/${id}/create-account`, {
            method: 'POST',
            body: JSON.stringify(body),
        })
        return NextResponse.json(result)
    } catch (e: any) {
        const msg = e?.message || 'خطأ في إنشاء الحساب'
        return NextResponse.json({ error: msg }, { status: 500 })
    }
}
