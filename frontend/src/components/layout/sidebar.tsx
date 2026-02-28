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
    School
} from "lucide-react"

const navigation = [
    { name: "لوحة القيادة", href: "/dashboard", icon: LayoutDashboard },
    { name: "البوابة الأكاديمية", href: "/dashboard/academics", icon: BookOpen },
    { name: "الطلاب", href: "/dashboard/students", icon: Users },
    { name: "المعلمون", href: "/dashboard/teachers", icon: GraduationCap },
    { name: "أدوات المدير", href: "/dashboard/manager-tools", icon: Sparkles },
    { name: "المالية", href: "/dashboard/finance", icon: Wallet },
    { name: "الإعدادات", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar({ userRole }: { userRole: string }) {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col bg-white border-l border-blue-100 shadow-sm">
            {/* Logo */}
            <div className="flex h-16 shrink-0 items-center gap-3 px-6 border-b border-blue-50">
                <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                    <School className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-blue-900">منصة المدرسة</span>
            </div>

            <nav className="flex flex-1 flex-col px-3 pt-4 pb-4 overflow-y-auto">
                <ul role="list" className="flex flex-1 flex-col gap-y-1">
                    {navigation.filter(item => {
                        if (userRole === "Teacher" && ["الطلاب", "المعلمون", "أدوات المدير", "المالية"].includes(item.name)) {
                            return false
                        }
                        return true
                    }).map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            "h-5 w-5 shrink-0",
                                            isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            </li>
                        )
                    })}

                    <li className="mt-auto pt-4 border-t border-slate-100">
                        <Link
                            href="/login"
                            className="group flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-red-500" aria-hidden="true" />
                            تسجيل الخروج
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}
