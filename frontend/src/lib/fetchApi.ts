import { createClient } from './supabase/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1'

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
    // Extract session token from authenticated SSR context
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    const headers = new Headers(options.headers)
    headers.set('Content-Type', 'application/json')

    if (session?.access_token) {
        headers.set('Authorization', `Bearer ${session.access_token}`)
    }

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

    try {
        const res = await fetch(url, {
            ...options,
            headers,
        })

        // If response is not JSON (e.g., 204 No Content text), catch and return null gracefully
        let data;
        try {
            data = await res.json()
        } catch (e) {
            if (!res.ok) {
                // Return text if JSON fails on a bad response
                const text = await res.text().catch(() => '')
                throw new Error(`API Error ${res.status}: ${text}`)
            }
            return null
        }

        if (!res.ok) {
            throw new Error(data?.detail || data?.message || `API Error ${res.status}`)
        }

        return data

    } catch (error) {
        console.error(`[fetchApi Error] ${endpoint}:`, error)
        throw error
    }
}
