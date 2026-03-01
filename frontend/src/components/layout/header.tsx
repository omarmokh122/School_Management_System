"use client"

import { Search } from "lucide-react"
import { NotificationBell } from "./NotificationBell"

interface Props {
    userName: string
    userRole: string
    userInitial: string
    students: any[]
    finance: any[]
    announcements: any[]
}

export function Header({ userName, userRole, userInitial, students, finance, announcements }: Props) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-white px-6 sticky top-0 z-40 shadow-sm no-print" style={{ borderColor: 'var(--border)' }}>
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--text-subtle)' }} />
                <input
                    type="text"
                    placeholder="Search students, teachers..."
                    className="w-full h-9 rounded-lg border pl-9 pr-4 text-sm outline-none transition-all"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                    onFocus={e => {
                        (e.target as HTMLElement).style.borderColor = 'var(--accent)'
                            ; (e.target as HTMLElement).style.background = '#fff'
                            ; (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(79,70,229,.12)'
                    }}
                    onBlur={e => {
                        (e.target as HTMLElement).style.borderColor = 'var(--border)'
                            ; (e.target as HTMLElement).style.background = 'var(--surface-alt)'
                            ; (e.target as HTMLElement).style.boxShadow = 'none'
                    }}
                />
            </div>

            <div className="flex-1" />


            <div className="flex items-center gap-2">
                {/* Smart Notification Bell */}
                <NotificationBell students={students} finance={finance} announcements={announcements} />

                <div className="h-6 w-px mx-1" style={{ background: '#E5E7EB' }} />

                {/* Profile Button */}
                <button
                    className="flex items-center gap-2.5 rounded-lg border border-gray-200 pl-3 pr-1.5 py-1.5 text-right transition-colors"
                    style={{ background: '#fff' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
                >
                    <div className="leading-tight">
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{userName}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{userRole}</p>
                    </div>
                    <div
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'var(--blue-primary)' }}
                    >
                        {userInitial}
                    </div>
                </button>
            </div>
        </header>
    )
}
