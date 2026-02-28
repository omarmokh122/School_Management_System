import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect } from "next/navigation"
import { AttendanceTracker } from "./AttendanceTracker"

export default async function AttendancePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const schoolId = user?.user_metadata?.school_id || ''
    const userId = user?.id || ''
    let classes: any[] = [], teachers: any[] = []

    try {
        classes = await fetchApi('/academic/classes/matrix') || []
        teachers = await fetchApi('/teachers/') || []
    } catch { }

    // Find teacher record if user is a teacher
    const teacherRecord = teachers.find((t: any) => t.user_id === userId)

    return <AttendanceTracker
        schoolId={schoolId}
        teacherId={teacherRecord?.id || null}
        classes={classes}
    />
}
