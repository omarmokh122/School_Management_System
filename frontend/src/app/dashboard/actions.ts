'use server'

import { fetchApi } from '@/lib/fetchApi'

export async function addScheduleSlot(payload: any) {
    try {
        const res = await fetchApi('/schedule/', { method: 'POST', body: JSON.stringify(payload) })
        return { success: true, data: res }
    } catch (e: any) { return { success: false, error: e.message } }
}

export async function deleteScheduleSlot(slotId: string) {
    try {
        await fetchApi(`/schedule/${slotId}`, { method: 'DELETE' })
        return { success: true }
    } catch (e: any) { return { success: false, error: e.message } }
}

export async function submitAttendance(payload: any) {
    try {
        const res = await fetchApi('/attendance/bulk', { method: 'POST', body: JSON.stringify(payload) })
        return { success: true, data: res }
    } catch (e: any) { return { success: false, error: e.message } }
}

export async function createAnnouncement(payload: any) {
    try {
        const res = await fetchApi('/announcements/', { method: 'POST', body: JSON.stringify(payload) })
        return { success: true, data: res }
    } catch (e: any) { return { success: false, error: e.message } }
}

export async function deleteAnnouncement(annId: string) {
    try {
        await fetchApi(`/announcements/${annId}`, { method: 'DELETE' })
        return { success: true }
    } catch (e: any) { return { success: false, error: e.message } }
}

export async function createCalendarEvent(payload: any) {
    try {
        const res = await fetchApi('/calendar/', { method: 'POST', body: JSON.stringify(payload) })
        return { success: true, data: res }
    } catch (e: any) { return { success: false, error: e.message } }
}

export async function deleteCalendarEvent(eventId: string) {
    try {
        await fetchApi(`/calendar/${eventId}`, { method: 'DELETE' })
        return { success: true }
    } catch (e: any) { return { success: false, error: e.message } }
}
