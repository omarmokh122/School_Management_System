'use server'

import { fetchApi } from '@/lib/fetchApi'

export async function createFinancialRecord(payload: any) {
    try {
        const response = await fetchApi('/finance/', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        return { success: true, data: response }
    } catch (error: any) {
        return { success: false, error: error.message || 'Error creating record' }
    }
}

export async function updateFinancialRecord(recordId: string, payload: any) {
    try {
        const response = await fetchApi(`/finance/${recordId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        })
        return { success: true, data: response }
    } catch (error: any) {
        return { success: false, error: error.message || 'Error updating record' }
    }
}
