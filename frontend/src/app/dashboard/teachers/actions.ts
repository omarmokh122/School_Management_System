'use server'

import { fetchApi } from '@/lib/fetchApi'

export async function createTeacher(payload: any) {
    try {
        const response = await fetchApi('/teachers/', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
        return { success: true, data: response }
    } catch (error: any) {
        return { success: false, error: error.message || 'Error adding teacher' }
    }
}

export async function updateTeacher(teacherId: string, payload: any) {
    try {
        const response = await fetchApi(`/teachers/${teacherId}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        })
        return { success: true, data: response }
    } catch (error: any) {
        return { success: false, error: error.message || 'Error updating teacher' }
    }
}
