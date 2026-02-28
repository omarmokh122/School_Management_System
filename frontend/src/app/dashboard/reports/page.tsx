import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect } from "next/navigation"
import { ReportsClient } from "./ReportsClient"

export default async function ReportsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const schoolId = user?.user_metadata?.school_id || ''
    let students: any[] = [], classes: any[] = [], finance: any[] = []

    try {
        students = await fetchApi('/students/') || []
        classes = await fetchApi('/academic/classes/matrix') || []
        finance = await fetchApi('/finance/') || []
    } catch { }

    return <ReportsClient
        schoolId={schoolId}
        students={students}
        classes={classes}
        finance={finance}
    />
}
