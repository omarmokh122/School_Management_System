"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
    LayoutDashboard, Users, GraduationCap, Wallet,
    Settings, LogOut, School, BrainCircuit,
    FileBarChart, CalendarDays, Megaphone, Zap
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// ── Navigation items (flat, no sections) ────────────────────────
const NAV_ITEMS = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["Admin", "SuperAdmin", "Teacher"] },
    { name: "Students", href: "/dashboard/students", icon: Users, roles: ["Admin", "SuperAdmin"] },
    { name: "Teachers", href: "/dashboard/teachers", icon: GraduationCap, roles: ["Admin", "SuperAdmin"] },
    { name: "Academics", href: "/dashboard/academics", icon: School, roles: ["Admin", "SuperAdmin", "Teacher"] },
    { name: "Schedule", href: "/dashboard/schedule", icon: CalendarDays, roles: ["Admin", "SuperAdmin", "Teacher"] },
    { name: "Announcements", href: "/dashboard/announcements", icon: Megaphone, roles: ["Admin", "SuperAdmin", "Teacher"] },
    { name: "Finance", href: "/dashboard/finance", icon: Wallet, roles: ["Admin", "SuperAdmin"] },
    { name: "Reports", href: "/dashboard/reports", icon: FileBarChart, roles: ["Admin", "SuperAdmin"] },
    { name: "AI Tools", href: "/dashboard/teacher-tools", icon: BrainCircuit, roles: ["Teacher"] },
    { name: "Admin AI", href: "/dashboard/admin-tools", icon: Zap, roles: ["Admin", "SuperAdmin"] },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["Admin", "SuperAdmin", "Teacher"] },
]

export function Sidebar({ userRole, userName, userInitial }: { userRole: string; userName?: string; userInitial?: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(userRole))

    return (
        <aside style={{
            width: 232,
            flexShrink: 0,
            background: 'var(--sidebar-bg)',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',  // NO scroll ever
        }}>
            {/* Logo */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                height: 64, padding: '0 20px',
                borderBottom: '1px solid var(--sidebar-border)',
                flexShrink: 0,
            }}>
                <div style={{
                    height: 34, width: 34, borderRadius: 10, flexShrink: 0,
                    background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <School style={{ height: 18, width: 18, color: '#fff' }} />
                </div>
                <div>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--sidebar-text)', letterSpacing: '-0.01em' }}>EduSmart</p>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--sidebar-muted)', marginTop: 1 }}>School Platform</p>
                </div>
            </div>

            {/* Nav — fills remaining space, no scroll */}
            <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 1, overflow: 'hidden' }}>
                {visibleItems.map(item => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '8px 12px', borderRadius: 8,
                                fontSize: '0.8125rem', fontWeight: isActive ? 600 : 500,
                                color: isActive ? '#fff' : 'var(--sidebar-muted)',
                                background: isActive ? 'var(--accent)' : 'transparent',
                                textDecoration: 'none', transition: 'all .15s',
                                flexShrink: 0,
                            }}
                            onMouseEnter={e => {
                                if (!isActive) {
                                    (e.currentTarget as HTMLElement).style.background = 'var(--sidebar-hover)'
                                        ; (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-text)'
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isActive) {
                                    (e.currentTarget as HTMLElement).style.background = 'transparent'
                                        ; (e.currentTarget as HTMLElement).style.color = 'var(--sidebar-muted)'
                                }
                            }}
                        >
                            <item.icon style={{ height: 15, width: 15, flexShrink: 0 }} />
                            <span style={{ flex: 1 }}>{item.name}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer — user + sign out */}
            <div style={{ padding: '10px', borderTop: '1px solid var(--sidebar-border)', flexShrink: 0 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 8,
                    background: 'var(--sidebar-hover)', marginBottom: 4
                }}>
                    <div style={{
                        height: 28, width: 28, borderRadius: '50%',
                        background: 'var(--accent)', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.6875rem', fontWeight: 700, color: '#fff'
                    }}>
                        {userInitial || 'A'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sidebar-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {userName || 'Admin'}
                        </p>
                        <p style={{ fontSize: '0.625rem', color: 'var(--sidebar-muted)', marginTop: 1 }}>{userRole}</p>
                    </div>
                </div>
                <button
                    onClick={handleSignOut}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        width: '100%', padding: '8px 12px', borderRadius: 8,
                        fontSize: '0.8125rem', fontWeight: 500, color: '#F87171',
                        background: 'none', border: 'none', cursor: 'pointer',
                        transition: 'background .15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,.1)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                >
                    <LogOut style={{ height: 14, width: 14, flexShrink: 0 }} />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}
