'use server'

import { fetchApi } from '@/lib/fetchApi'

export async function createClass(payload: any) {
    try {
        const response = await fetchApi('/academic/classes', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        return { success: true, data: response }
    } catch (error: any) {
        return { success: false, error: error.message || 'Error creating class' }
    }
}
