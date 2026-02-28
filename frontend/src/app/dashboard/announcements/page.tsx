import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect } from "next/navigation"
import { AnnouncementsClient } from "./AnnouncementsClient"

export default async function AnnouncementsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const schoolId = user?.user_metadata?.school_id || ''
    let announcements: any[] = []

    try { announcements = await fetchApi('/announcements/') || [] } catch { }

    return <AnnouncementsClient
        schoolId={schoolId}
        authorId={user.id}
        initialAnnouncements={announcements}
    />
}
