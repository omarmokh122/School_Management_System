"use client"

import { Bell, Search } from "lucide-react"

export function Header() {
    return (
        <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-x-6 border-b border-slate-200/60 bg-white/80 px-4 shadow-sm sm:px-6 lg:px-8 backdrop-blur-xl transition-all">
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between items-center">
                <form className="relative flex flex-1 max-w-md" action="#" method="GET">
                    <label htmlFor="search-field" className="sr-only">
                        بحث
                    </label>
                    <Search
                        className="pointer-events-none absolute inset-y-0 right-4 h-full w-5 text-slate-400"
                        aria-hidden="true"
                    />
                    <input
                        id="search-field"
                        className="block h-full w-full border-0 bg-transparent py-0 pr-12 pl-4 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm focus:outline-none"
                        placeholder="البحث عن الطلاب، الفواتير..."
                        type="search"
                        name="search"
                    />
                </form>

                <div className="flex items-center gap-x-6">
                    <button type="button" className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-600 relative transition-colors">
                        <span className="sr-only">الإشعارات</span>
                        <Bell className="h-6 w-6" aria-hidden="true" />
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-transparent"></span>
                    </button>

                    {/* Separator */}
                    <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200" aria-hidden="true" />

                    {/* Profile dropdown */}
                    <div className="flex items-center gap-x-4 cursor-pointer hover:opacity-80 transition-opacity">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                            أ
                        </div>
                        <div className="hidden lg:flex lg:flex-col lg:items-start text-right">
                            <span className="text-sm font-semibold leading-6 text-slate-900" aria-hidden="true">
                                أحمد المدير
                            </span>
                            <span className="text-xs font-medium text-slate-500">مدير النظام</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
