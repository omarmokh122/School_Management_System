import { NextRequest, NextResponse } from 'next/server'
import { fetchApi } from '@/lib/fetchApi'

export async function GET(req: NextRequest) {
    const year = req.nextUrl.searchParams.get('year')
    const month = req.nextUrl.searchParams.get('month')
    try {
        const data = await fetchApi(`/calendar/?year=${year}&month=${month}`)
        return NextResponse.json(data || [])
    } catch {
        return NextResponse.json([])
    }
}
