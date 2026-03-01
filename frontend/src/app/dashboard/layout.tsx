import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userRole = user?.user_metadata?.role || "Teacher"
    const userName = `${user?.user_metadata?.first_name || ''} ${user?.user_metadata?.last_name || ''}`.trim() || 'مدير النظام'
    const userInitial = (user?.user_metadata?.first_name?.[0] || user?.email?.[0] || 'م').toUpperCase()

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <Sidebar userRole={userRole} userName={userName} userInitial={userInitial} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header
                    userName={userName}
                    userRole={userRole}
                    userInitial={userInitial}
                    students={[]}
                    finance={[]}
                    announcements={[]}
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

