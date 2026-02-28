'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, AlertCircle, CreditCard, Users, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NotificationItem {
    id: string
    type: 'attendance' | 'finance' | 'announcement'
    title: string
    subtitle: string
    href: string
    color: string
    bg: string
}

interface Props {
    students: any[]
    finance: any[]
    announcements: any[]
}

export function NotificationBell({ students, finance, announcements }: Props) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const router = useRouter()

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Build notifications
    const notifications: NotificationItem[] = []

    // Urgent announcements
    announcements.filter(a => a.priority === 'urgent').slice(0, 3).forEach(a => {
        notifications.push({
            id: `ann-${a.id}`,
            type: 'announcement',
            title: a.title,
            subtitle: 'إعلان عاجل',
            href: '/dashboard/announcements',
            color: '#DC2626',
            bg: '#FEF2F2',
        })
    })

    // Overdue payments
    const overdueGroups: Record<string, number> = {}
    finance.filter(f => f.status === 'overdue').forEach(f => {
        if (f.student_id) overdueGroups[f.student_id] = (overdueGroups[f.student_id] || 0) + parseFloat(f.amount || 0)
    })
    Object.entries(overdueGroups).slice(0, 3).forEach(([sid, amount]) => {
        const s = students.find(st => st.id === sid)
        if (s) {
            notifications.push({
                id: `fin-${sid}`,
                type: 'finance',
                title: `${s.first_name} ${s.last_name}`,
                subtitle: `رسوم متأخرة: $${amount.toFixed(0)}`,
                href: `/dashboard/students/${sid}`,
                color: '#D97706',
                bg: '#FFFBEB',
            })
        }
    })

    const unreadCount = notifications.length

    const ICONS: Record<string, any> = {
        announcement: AlertCircle,
        finance: CreditCard,
        attendance: Users,
    }

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                onClick={() => setOpen(!open)}
                className="relative h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 transition-colors"
                style={{ background: open ? '#F3F4F6' : '#fff', color: 'var(--text-muted)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; (e.currentTarget as HTMLElement).style.color = 'var(--blue-primary)' }}
                onMouseLeave={e => { if (!open) { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' } }}
            >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                    <span
                        style={{
                            position: 'absolute', top: 4, right: 4,
                            height: 16, minWidth: 16, padding: '0 3px',
                            background: '#EF4444', color: 'white',
                            borderRadius: 8, fontSize: 9, fontWeight: 800,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px solid white',
                        }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div
                    style={{
                        position: 'absolute', top: 42, right: 0, left: 'auto',
                        width: 320, background: '#fff',
                        border: '1px solid #E5E7EB', borderRadius: 12,
                        boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                        zIndex: 1000, overflow: 'hidden',
                    }}
                    dir="rtl"
                >
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>الإشعارات</p>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 1 }}>
                                {unreadCount > 0 ? `${unreadCount} إشعار جديد` : 'لا توجد إشعارات'}
                            </p>
                        </div>
                        <button onClick={() => setOpen(false)} style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}>
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                <Bell style={{ height: 32, width: 32, margin: '0 auto 8px', opacity: 0.3 }} />
                                <p>كل شيء على ما يرام 🎉</p>
                                <p style={{ fontSize: '0.75rem', marginTop: 4 }}>لا توجد تنبيهات تستدعي الانتباه</p>
                            </div>
                        ) : notifications.map((n) => {
                            const Icon = ICONS[n.type]
                            return (
                                <button
                                    key={n.id}
                                    onClick={() => { setOpen(false); router.push(n.href) }}
                                    style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 12,
                                        padding: '12px 16px', width: '100%', cursor: 'pointer',
                                        background: 'none', border: 'none', borderBottom: '1px solid #F9FAFB',
                                        textAlign: 'right', transition: 'background .1s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
                                >
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Icon style={{ height: 18, width: 18, color: n.color }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.8375rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {n.title}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: n.color, fontWeight: 600, marginTop: 1 }}>{n.subtitle}</p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    <div style={{ padding: '10px 16px', borderTop: '1px solid #F3F4F6', textAlign: 'center' }}>
                        <button
                            onClick={() => { setOpen(false); router.push('/dashboard/reports') }}
                            style={{ fontSize: '0.8125rem', color: 'var(--blue-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            عرض تقرير شامل
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
