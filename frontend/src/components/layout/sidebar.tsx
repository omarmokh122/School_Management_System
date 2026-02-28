"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard, Users, GraduationCap, Wallet,
    BookOpen, Settings, LogOut, Sparkles, School, ChevronLeft,
    CalendarDays, ClipboardList, Megaphone, BookMarked, Calendar
} from "lucide-react"

const SECTIONS = [
    {
        label: 'الرئيسية',
        items: [
            { name: "الرئيسية", href: "/dashboard", icon: LayoutDashboard },
            { name: "الطلاب", href: "/dashboard/students", icon: Users },
            { name: "المعلمون", href: "/dashboard/teachers", icon: GraduationCap },
            { name: "البوابة الأكاديمية", href: "/dashboard/academics", icon: BookOpen },
        ]
    },
    {
        label: 'إدارة الصف',
        items: [
            { name: "الجدول الدراسي", href: "/dashboard/schedule", icon: CalendarDays },
            { name: "الحضور والغياب", href: "/dashboard/attendance", icon: ClipboardList },
            { name: "دفتر الدرجات", href: "/dashboard/gradebook", icon: BookMarked },
            { name: "التقويم المدرسي", href: "/dashboard/calendar", icon: Calendar },
            { name: "الإعلانات", href: "/dashboard/announcements", icon: Megaphone },
        ]
    },
    {
        label: 'الإدارة',
        items: [
            { name: "أدوات المدير", href: "/dashboard/manager-tools", icon: Sparkles },
            { name: "المالية", href: "/dashboard/finance", icon: Wallet },
            { name: "الإعدادات", href: "/dashboard/settings", icon: Settings },
        ]
    },
]

const TEACHER_HIDDEN = ["الطلاب", "المعلمون", "أدوات المدير", "المالية"]

export function Sidebar({ userRole }: { userRole: string }) {
    const pathname = usePathname()

    return (
        <aside style={{ width: 240, flexShrink: 0 }} className="flex flex-col h-full bg-white border-l border-gray-200">
            {/* Logo */}
            <div className="flex items-center gap-3 h-16 px-5 border-b border-gray-100">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: 'var(--blue-primary)' }}>
                    <School className="h-5 w-5 text-white" />
                </div>
                <div className="leading-tight">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>إدارة المدرسة</p>
                    <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>EduSmart Platform</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
                {SECTIONS.map(section => {
                    const visibleItems = section.items.filter(item =>
                        !(userRole === "Teacher" && TEACHER_HIDDEN.includes(item.name))
                    )
                    if (visibleItems.length === 0) return null
                    return (
                        <div key={section.label}>
                            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-subtle)' }}>
                                {section.label}
                            </p>
                            <div className="space-y-0.5">
                                {visibleItems.map(item => {
                                    const active = pathname === item.href
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150"
                                            style={{
                                                background: active ? 'var(--blue-light)' : 'transparent',
                                                color: active ? 'var(--blue-primary)' : 'var(--text-muted)',
                                                fontWeight: active ? '700' : '500',
                                            }}
                                            onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' } }}
                                            onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' } }}
                                        >
                                            <item.icon className="h-4 w-4 flex-shrink-0" />
                                            <span className="flex-1">{item.name}</span>
                                            {active && <ChevronLeft className="h-3.5 w-3.5 opacity-60" />}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-gray-100 p-3 space-y-0.5">
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 mb-1" style={{ background: '#F9FAFB' }}>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'var(--blue-primary)' }}>م</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>مدير النظام</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{userRole}</p>
                    </div>
                </div>
                <Link
                    href="/login"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                    style={{ color: 'var(--danger)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FEF2F2'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    تسجيل الخروج
                </Link>
            </div>
        </aside>
    )
}
