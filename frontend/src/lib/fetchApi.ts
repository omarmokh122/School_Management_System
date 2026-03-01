import { createClient } from './supabase/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    let session: any = null
    try {
        const supabase = await createClient()
        const { data } = await supabase.auth.getSession()
        session = data.session
    } catch { /* can't get session — proceed unauthenticated */ }

    const headers = new Headers(options.headers)
    if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json')
    }
    if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`)
    }

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

    let res: Response
    try {
        res = await fetch(url, {
            ...options,
            headers,
            next: { revalidate: 0 },  // always fresh — caller controls caching via .catch
        })
    } catch (networkErr: any) {
        // ECONNREFUSED, DNS failure, timeout, etc.
        const msg = networkErr?.cause?.code === 'ECONNREFUSED'
            ? `Backend server is not running at ${API_BASE_URL}`
            : `Network error reaching ${endpoint}: ${networkErr?.message}`
        console.error(`[fetchApi Network Error] ${endpoint}:`, msg)
        throw new Error(msg)
    }

    const text = await res.text()
    let data: any = null

    if (text) {
        try {
            data = JSON.parse(text)
        } catch {
            if (!res.ok) throw new Error(`API Error ${res.status}: ${text}`)
        }
    }

    if (!res.ok) {
        const detail = data?.detail || data?.message || `API Error ${res.status}`
        console.error(`[fetchApi HTTP Error] ${endpoint}: ${detail}`)
        throw new Error(detail)
    }

    return data
}
