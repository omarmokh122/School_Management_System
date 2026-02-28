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
    Sparkles
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
        <div className="flex h-full w-72 flex-col bg-white/80 backdrop-blur-xl border-l border-slate-200/60 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.05)] transition-all">
            <div className="flex h-20 shrink-0 items-center px-8 bg-gradient-to-l from-indigo-50/50 to-transparent">
                <Sparkles className="h-8 w-8 text-indigo-600 ml-3" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-indigo-600 to-violet-600">
                    منصة المدرسة
                </span>
            </div>
            <nav className="flex flex-1 flex-col px-4 pt-6 pb-4 overflow-y-auto">
                <ul role="list" className="flex flex-1 flex-col gap-y-2">
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
                                        "group flex items-center gap-x-4 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200",
                                        isActive
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            "h-5 w-5 shrink-0 transition-transform duration-200",
                                            isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600",
                                            "group-hover:scale-110"
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            </li>
                        )
                    })}

                    <li className="mt-auto">
                        <Link
                            href="/login"
                            className="group flex gap-x-4 rounded-xl p-3 text-sm font-semibold leading-6 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-red-600" aria-hidden="true" />
                            تسجيل الخروج
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}
