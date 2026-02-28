import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userRole = user?.user_metadata?.role || "Teacher"
    const userName = `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || 'مدير النظام'
    const userInitial = (user?.user_metadata?.first_name?.[0] || user?.email?.[0] || 'م').toUpperCase()

    // Fetch notification data for the bell
    let students: any[] = [], finance: any[] = [], announcements: any[] = []
    try {
        ;[students, finance, announcements] = await Promise.all([
            fetchApi('/students/').catch(() => []),
            fetchApi('/finance/').catch(() => []),
            fetchApi('/announcements/').catch(() => []),
        ])
    } catch { }

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar userRole={userRole} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header
                    userName={userName}
                    userRole={userRole}
                    userInitial={userInitial}
                    students={students}
                    finance={finance}
                    announcements={announcements}
                />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
