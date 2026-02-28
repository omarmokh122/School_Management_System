import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect } from "next/navigation"
import { GradeBookClient } from "./GradeBookClient"

export default async function GradeBookPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const schoolId = user?.user_metadata?.school_id || ''
    const userRole = user?.user_metadata?.role || 'Teacher'
    let classes: any[] = []

    try { classes = await fetchApi('/academic/classes/matrix') || [] } catch { }

    return <GradeBookClient schoolId={schoolId} classes={classes} userRole={userRole} />
}
