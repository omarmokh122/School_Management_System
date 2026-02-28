"use client"

import { Bell, Search, Menu } from "lucide-react"

export function Header() {
    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-slate-100 bg-white px-6 shadow-sm">
            <div className="flex flex-1 items-center gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="بحث سريع..."
                        className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50 pr-10 pl-4 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Notification */}
                <button className="relative h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
                </button>

                <div className="h-6 w-px bg-slate-200 mx-1" />

                {/* Profile */}
                <button className="flex items-center gap-2.5 rounded-xl border border-slate-200 py-1.5 pr-3 pl-1.5 hover:bg-slate-50 transition-colors">
                    <div className="text-right">
                        <p className="text-xs font-semibold text-slate-800 leading-tight">مدير النظام</p>
                        <p className="text-[10px] text-slate-400">Admin</p>
                    </div>
                    <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        م
                    </div>
                </button>
            </div>
        </header>
    )
}
