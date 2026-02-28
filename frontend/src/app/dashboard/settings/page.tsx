import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect } from "next/navigation"
import { SettingsClient } from "./SettingsClient"

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const schoolId = user?.user_metadata?.school_id || ''
    const userRole = user?.user_metadata?.role || 'Teacher'
    let school: any = null

    try {
        // Fetch school info if API exists; gracefully fallback
        const schools = await fetchApi('/schools/') || []
        school = Array.isArray(schools) ? schools[0] : schools
    } catch { }

    return <SettingsClient
        schoolId={schoolId}
        userRole={userRole}
        school={school}
        user={user}
    />
}
