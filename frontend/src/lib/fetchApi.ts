import { createClient } from './supabase/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'

async function getSessionToken(): Promise<string | null> {
    try {
        const supabase = await createClient()
        const { data } = await supabase.auth.getSession()
        return data.session?.access_token ?? null
    } catch {
        return null
    }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const token = await getSessionToken()
    const headers = new Headers(options.headers)
    if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json')
    }
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

    let res: Response
    try {
        res = await fetch(url, { ...options, headers, next: { revalidate: 0 } })
    } catch (networkErr: any) {
        const msg = networkErr?.cause?.code === 'ECONNREFUSED'
            ? `Backend server is not running at ${API_BASE_URL}`
            : `Network error: ${networkErr?.message}`
        console.error(`[fetchApi] ${endpoint}:`, msg)
        throw new Error(msg)
    }

    const text = await res.text()
    let data: any = null
    if (text) {
        try { data = JSON.parse(text) }
        catch { if (!res.ok) throw new Error(`API Error ${res.status}: ${text}`) }
    }
    if (!res.ok) {
        const detail = data?.detail || data?.message || `API Error ${res.status}`
        throw new Error(detail)
    }
    return data
}

/** Cached version — use for read-heavy data that rarely changes. Default TTL: 30s */
export async function fetchApiCached(endpoint: string, ttlSeconds = 30) {
    const token = await getSessionToken()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

    let res: Response
    try {
        res = await fetch(url, { headers, next: { revalidate: ttlSeconds } })
    } catch (networkErr: any) {
        throw new Error(`Network error: ${networkErr?.message}`)
    }

    if (!res.ok) return null
    const text = await res.text()
    try { return text ? JSON.parse(text) : null }
    catch { return null }
}
