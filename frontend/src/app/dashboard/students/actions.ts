'use server'

import { fetchApi } from '@/lib/fetchApi'

export async function createStudent(payload: any) {
    try {
        const response = await fetchApi('/students/', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        return { success: true, data: response }
    } catch (error: any) {
        return { success: false, error: error.message || 'Error adding student' }
    }
}

export async function updateStudent(studentId: string, payload: any) {
    try {
        const response = await fetchApi(`/students/${studentId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        })
        return { success: true, data: response }
    } catch (error: any) {
        return { success: false, error: error.message || 'Error updating student' }
    }
}
