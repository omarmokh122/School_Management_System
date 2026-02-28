import { NextRequest, NextResponse } from 'next/server'
import { fetchApi } from '@/lib/fetchApi'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const result = await fetchApi('/academic/grades', {
            method: 'POST',
            body: JSON.stringify(body),
        })
        return NextResponse.json(result)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
