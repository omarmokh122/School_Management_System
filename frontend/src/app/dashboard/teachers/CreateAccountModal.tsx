'use client'

import { useState } from 'react'
import { UserPlus, Copy, Check, Eye, EyeOff } from 'lucide-react'

interface Props {
    teacherId: string
    teacherName: string
}

export function CreateAccountModal({ teacherId, teacherName }: Props) {
    const [isOpen, setIsOpen] = useState(false)
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [result, setResult] = useState<{ email: string; temp_password: string } | null>(null)
    const [copied, setCopied] = useState(false)
    const [showPass, setShowPass] = useState(false)

    const handleCreate = async () => {
        if (!email.includes('@')) { setError('أدخل بريداً إلكترونياً صحيحاً'); return }
        setLoading(true)
        setError('')
        try {
            const res = await fetch(`/api/teachers/${teacherId}/create-account`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'فشل إنشاء الحساب')
            } else {
                setResult(data)
            }
        } catch {
            setError('تعذر الاتصال بالخادم')
        }
        setLoading(false)
    }

    const copyToClipboard = () => {
        if (!result) return
        navigator.clipboard.writeText(`البريد: ${result.email}\nكلمة المرور: ${result.temp_password}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const close = () => {
        setIsOpen(false)
        setEmail('')
        setError('')
        setResult(null)
        setShowPass(false)
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                title="إنشاء حساب تسجيل دخول"
                style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: '0.75rem', fontWeight: 600, color: '#7C3AED',
                    background: '#F5F3FF', border: '1px solid #DDD6FE',
                    borderRadius: 8, padding: '4px 10px', cursor: 'pointer',
                    transition: 'all .15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#EDE9FE'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#F5F3FF'}
            >
                <UserPlus className="h-3.5 w-3.5" /> حساب
            </button>

            {isOpen && (
                <div className="modal-overlay" onClick={close}>
                    <div className="modal-box max-w-sm" dir="rtl" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">إنشاء حساب لـ {teacherName}</h3>
                            <button onClick={close} style={{ color: 'var(--text-muted)' }}>✕</button>
                        </div>

                        {!result ? (
                            <div className="modal-body space-y-4">
                                <div className="p-3 rounded-xl" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                                    <p style={{ fontSize: '0.8125rem', color: '#5B21B6', lineHeight: 1.5 }}>
                                        سيتم إنشاء حساب Supabase للمعلم، وستظهر كلمة مرور مؤقتة يمكنك مشاركتها معه.
                                    </p>
                                </div>
                                <div>
                                    <label className="form-label">البريد الإلكتروني للمعلم *</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="teacher@school.com"
                                        value={email}
                                        onChange={e => { setEmail(e.target.value); setError('') }}
                                    />
                                </div>
                                {error && (
                                    <p style={{ fontSize: '0.8125rem', color: '#DC2626', background: '#FEF2F2', padding: '8px 12px', borderRadius: 8, border: '1px solid #FECACA' }}>
                                        {error}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="modal-body space-y-3">
                                <div className="p-4 rounded-xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#15803D', marginBottom: 6 }}>✅ تم إنشاء الحساب بنجاح!</p>
                                    <p style={{ fontSize: '0.75rem', color: '#16A34A' }}>شارك بيانات الدخول مع المعلم وأخبره بتغيير كلمة المرور عند أول تسجيل دخول.</p>
                                </div>
                                <div>
                                    <label className="form-label">البريد الإلكتروني</label>
                                    <input readOnly className="form-input" value={result.email} style={{ opacity: 0.75 }} />
                                </div>
                                <div>
                                    <label className="form-label">كلمة المرور المؤقتة</label>
                                    <div className="flex gap-2">
                                        <input
                                            readOnly
                                            type={showPass ? 'text' : 'password'}
                                            className="form-input flex-1"
                                            value={result.temp_password}
                                            style={{ fontFamily: 'monospace', letterSpacing: showPass ? 1 : 3 }}
                                        />
                                        <button
                                            onClick={() => setShowPass(!showPass)}
                                            style={{ padding: '0 12px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB', cursor: 'pointer' }}
                                        >
                                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="btn-secondary w-full"
                                    style={copied ? { color: '#059669', borderColor: '#059669' } : {}}
                                >
                                    {copied ? <><Check className="h-4 w-4" /> تم النسخ!</> : <><Copy className="h-4 w-4" /> نسخ بيانات الدخول</>}
                                </button>
                            </div>
                        )}

                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={close}>
                                {result ? 'إغلاق' : 'إلغاء'}
                            </button>
                            {!result && (
                                <button className="btn-primary" onClick={handleCreate} disabled={loading || !email}>
                                    {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
