import { login } from './actions'

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const errorParam = (await searchParams).error

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
                    تسجيل الدخول للنظام
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    منصة إدارة المدرسة الحديثة الخاصة بك
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white/80 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-100 backdrop-blur-xl">
                    {errorParam && (
                        <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-200">
                            <h3 className="text-sm font-medium text-red-800">فشل تسجيل الدخول</h3>
                            <p className="mt-1 text-xs text-red-700">{errorParam}</p>
                        </div>
                    )}
                    <form className="space-y-6" action={login}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                                البريد الإلكتروني
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                    placeholder="admin@school.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
                                كلمة المرور
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full rounded-xl border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 accent-indigo-600"
                                />
                                <label htmlFor="remember-me" className="mr-3 block text-sm leading-6 text-slate-900">
                                    تذكرني
                                </label>
                            </div>

                            <div className="text-sm leading-6">
                                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                    نسيت كلمة المرور؟
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 hover:shadow-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                تسجيل الدخول
                            </button>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-sm" style={{ color: '#6B7280' }}>
                        مدرسة جديدة؟{' '}
                        <a href="/register" style={{ color: '#0056D2', fontWeight: 700, textDecoration: 'none' }}>
                            سجّل مدرستك مجاناً
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
