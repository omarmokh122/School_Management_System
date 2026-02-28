import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect, notFound } from "next/navigation"
import { StudentProfile } from "./StudentProfile"

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const schoolId = user?.user_metadata?.school_id || ''

    let student: any = null, attendance: any = null, finance: any = []
    try {
        const students = await fetchApi('/students/') || []
        student = students.find((s: any) => s.id === id)
        if (!student) notFound()
        attendance = await fetchApi(`/attendance/student/${id}/summary`).catch(() => null)
        finance = await fetchApi('/finance/')
            .then((f: any[]) => f?.filter((r: any) => r.student_id === id) || [])
            .catch(() => [])
    } catch { }

    return <StudentProfile student={student} attendance={attendance} finance={finance} schoolId={schoolId} />
}
