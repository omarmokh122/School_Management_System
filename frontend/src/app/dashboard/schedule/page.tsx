import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect } from "next/navigation"
import { ScheduleBuilder } from "./ScheduleBuilder"

export default async function SchedulePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const schoolId = user?.user_metadata?.school_id || ''
    let slots: any[] = [], classes: any[] = [], teachers: any[] = []

    try {
        slots = await fetchApi('/schedule/') || []
        classes = await fetchApi('/academic/classes/matrix') || []
        teachers = await fetchApi('/teachers/') || []
    } catch { }

    return <ScheduleBuilder
        schoolId={schoolId}
        initialSlots={slots}
        classes={classes}
        teachers={teachers}
    />
}
