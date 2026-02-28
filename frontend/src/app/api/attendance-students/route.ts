import { NextRequest, NextResponse } from 'next/server'
import { fetchApi } from '@/lib/fetchApi'

export async function GET(req: NextRequest) {
    const classId = req.nextUrl.searchParams.get('class_id')
    if (!classId) return NextResponse.json([])
    try {
        const enrolled = await fetchApi(`/academic/enrollments/${classId}`)
        return NextResponse.json(enrolled || [])
    } catch {
        return NextResponse.json([])
    }
}
