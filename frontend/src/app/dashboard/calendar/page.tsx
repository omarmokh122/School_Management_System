import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect } from "next/navigation"
import { CalendarView } from "./CalendarView"

export default async function CalendarPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const schoolId = user?.user_metadata?.school_id || ''
    const now = new Date()
    let events: any[] = []

    try {
        events = await fetchApi(`/calendar/?year=${now.getFullYear()}&month=${now.getMonth() + 1}`) || []
    } catch { }

    return <CalendarView schoolId={schoolId} initialEvents={events} initialYear={now.getFullYear()} initialMonth={now.getMonth() + 1} />
}
