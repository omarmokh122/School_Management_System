"use client"

import { Bell, Search } from "lucide-react"

export function Header() {
    return (
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-6 sticky top-0 z-40 shadow-sm">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--text-subtle)' }} />
                <input
                    type="text"
                    placeholder="ابحث عن طالب، معلم..."
                    className="w-full h-9 rounded-lg border border-gray-200 pr-9 pl-4 text-sm outline-none transition-all"
                    style={{
                        background: '#F9FAFB',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                    }}
                    onFocus={e => {
                        (e.target as HTMLElement).style.borderColor = 'var(--blue-primary)'
                            ; (e.target as HTMLElement).style.background = '#fff'
                            ; (e.target as HTMLElement).style.boxShadow = '0 0 0 3px rgba(0,86,210,.12)'
                    }}
                    onBlur={e => {
                        (e.target as HTMLElement).style.borderColor = '#E5E7EB'
                            ; (e.target as HTMLElement).style.background = '#F9FAFB'
                            ; (e.target as HTMLElement).style.boxShadow = 'none'
                    }}
                />
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <button
                    className="relative h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 transition-colors"
                    style={{ background: '#fff', color: 'var(--text-muted)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; (e.currentTarget as HTMLElement).style.color = 'var(--blue-primary)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}
                >
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full" style={{ background: '#EF4444', border: '2px solid white' }} />
                </button>

                <div className="h-6 w-px mx-1" style={{ background: '#E5E7EB' }} />

                {/* Profile */}
                <button
                    className="flex items-center gap-2.5 rounded-lg border border-gray-200 pl-3 pr-1.5 py-1.5 text-right transition-colors"
                    style={{ background: '#fff' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
                >
                    <div className="leading-tight">
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>مدير النظام</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Admin</p>
                    </div>
                    <div
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'var(--blue-primary)' }}
                    >م</div>
                </button>
            </div>
        </header>
    )
}
