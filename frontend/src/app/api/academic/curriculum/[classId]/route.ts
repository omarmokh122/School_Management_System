import { NextRequest, NextResponse } from 'next/server'
import { fetchApi } from '@/lib/fetchApi'

export async function GET(_req: NextRequest, { params }: { params: { classId: string } }) {
    try {
        const data = await fetchApi(`/academic/curriculum/${params.classId}`)
        return NextResponse.json(data)
    } catch (e: any) {
        return NextResponse.json({ found: false, error: e.message }, { status: 200 })
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: { classId: string } }) {
    try {
        const data = await fetchApi(`/academic/curriculum/${params.classId}`, { method: 'DELETE' })
        return NextResponse.json(data)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
