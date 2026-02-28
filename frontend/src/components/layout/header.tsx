"use client"

import { Bell, Search } from "lucide-react"

export function Header() {
    return (
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-6 border-b border-blue-100 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between items-center">
                <form className="relative flex flex-1 max-w-md" action="#" method="GET">
                    <label htmlFor="search-field" className="sr-only">بحث</label>
                    <Search className="pointer-events-none absolute inset-y-0 right-3 h-full w-4 text-slate-400" aria-hidden="true" />
                    <input
                        id="search-field"
                        className="block h-9 w-full rounded-lg border border-slate-200 bg-slate-50 py-0 pr-9 pl-4 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none"
                        placeholder="البحث عن الطلاب، المعلمين..."
                        type="search"
                        name="search"
                    />
                </form>

                <div className="flex items-center gap-x-4">
                    <button type="button" className="relative p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                        <span className="sr-only">الإشعارات</span>
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600 border-2 border-white"></span>
                    </button>

                    <div className="h-5 w-px bg-slate-200" aria-hidden="true" />

                    <div className="flex items-center gap-x-3 cursor-pointer">
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                            م
                        </div>
                        <div className="hidden lg:flex lg:flex-col text-right">
                            <span className="text-sm font-semibold text-slate-800">مدير النظام</span>
                            <span className="text-xs text-slate-400">Admin</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
