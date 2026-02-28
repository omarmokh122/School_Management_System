"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Wallet,
    BookOpen,
    Settings,
    LogOut,
    Sparkles,
    School,
    ChevronRight
} from "lucide-react"

const navigation = [
    { name: "الرئيسية", href: "/dashboard", icon: LayoutDashboard },
    { name: "البوابة الأكاديمية", href: "/dashboard/academics", icon: BookOpen },
    { name: "الطلاب", href: "/dashboard/students", icon: Users },
    { name: "المعلمون", href: "/dashboard/teachers", icon: GraduationCap },
    { name: "أدوات المدير", href: "/dashboard/manager-tools", icon: Sparkles },
    { name: "المالية", href: "/dashboard/finance", icon: Wallet },
    { name: "الإعدادات", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar({ userRole }: { userRole: string }) {
    const pathname = usePathname()

    const filtered = navigation.filter(item => {
        if (userRole === "Teacher" && ["الطلاب", "المعلمون", "أدوات المدير", "المالية"].includes(item.name)) {
            return false
        }
        return true
    })

    return (
        <div className="flex h-full w-64 flex-col bg-white border-l border-slate-100 shadow-sm flex-shrink-0">
            {/* Logo */}
            <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100">
                <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200 flex-shrink-0">
                    <School className="h-5 w-5 text-white" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900">منصة المدرسة</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">EduSmart</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-1 flex-col px-3 pt-5 pb-4 overflow-y-auto gap-0.5">
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">القائمة الرئيسية</p>
                {filtered.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                                isActive
                                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-4 w-4 flex-shrink-0 transition-colors",
                                    isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                                )}
                            />
                            <span className="flex-1">{item.name}</span>
                            {isActive && <ChevronRight className="h-3 w-3 opacity-70 rotate-180" />}
                        </Link>
                    )
                })}

                <div className="mt-auto pt-4 border-t border-slate-100">
                    {/* User Info */}
                    <div className="flex items-center gap-3 px-3 py-3 mb-1 rounded-xl bg-slate-50">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">م</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">مدير النظام</p>
                            <p className="text-[10px] text-slate-400">{userRole}</p>
                        </div>
                    </div>

                    <Link
                        href="/login"
                        className="group flex gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="h-4 w-4 flex-shrink-0 text-slate-400 group-hover:text-red-500" />
                        تسجيل الخروج
                    </Link>
                </div>
            </nav>
        </div>
    )
}
