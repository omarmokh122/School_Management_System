'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export function SchoolRegisterForm() {
    const router = useRouter()
    const [step, setStep] = useState<'form' | 'success'>('form')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [form, setForm] = useState({
        school_name: '', admin_first_name: '', admin_last_name: '',
        email: '', password: '', phone: '', city: ''
    })

    const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.school_name.trim() || !form.email.includes('@') || form.password.length < 8) {
            setError('يرجى ملء جميع الحقول المطلوبة وكلمة المرور يجب أن تكون 8 أحرف على الأقل')
            return
        }
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/register-school', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'فشل إنشاء الحساب، يرجى المحاولة مرة أخرى')
            } else {
                setStep('success')
                setTimeout(() => router.push('/dashboard'), 2500)
            }
        } catch {
            setError('تعذر الاتصال بالخادم')
        }
        setLoading(false)
    }

    if (step === 'success') {
        return (
            <div className="text-center py-6 space-y-4">
                <div className="flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ background: '#F0FDF4' }}>
                        <CheckCircle2 className="h-9 w-9" style={{ color: '#059669' }} />
                    </div>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>تم إنشاء مدرستك بنجاح!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>جاري توجيهك إلى لوحة التحكم...</p>
                <div className="flex justify-center">
                    <div style={{ height: 4, width: 120, background: '#E5E7EB', borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
                        <div style={{ height: '100%', width: '100%', background: '#059669', animation: 'progress 2.5s linear forwards', transformOrigin: 'left' }} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* School Info */}
            <div>
                <label className="form-label">اسم المدرسة *</label>
                <input
                    className="form-input"
                    placeholder="مثال: مدرسة النور الابتدائية"
                    value={form.school_name}
                    onChange={e => update('school_name', e.target.value)}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="form-label">مدينة المدرسة</label>
                    <input
                        className="form-input"
                        placeholder="القاهرة"
                        value={form.city}
                        onChange={e => update('city', e.target.value)}
                    />
                </div>
                <div>
                    <label className="form-label">هاتف المدرسة</label>
                    <input
                        className="form-input"
                        placeholder="+20 10 XXXX XXXX"
                        value={form.phone}
                        onChange={e => update('phone', e.target.value)}
                    />
                </div>
            </div>

            <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
                <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12 }}>بيانات حساب المدير</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                        <label className="form-label">الاسم الأول *</label>
                        <input className="form-input" placeholder="محمد" value={form.admin_first_name} onChange={e => update('admin_first_name', e.target.value)} required />
                    </div>
                    <div>
                        <label className="form-label">الاسم الأخير</label>
                        <input className="form-input" placeholder="العلي" value={form.admin_last_name} onChange={e => update('admin_last_name', e.target.value)} />
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label">البريد الإلكتروني *</label>
                    <input className="form-input" type="email" placeholder="admin@school.com" value={form.email} onChange={e => update('email', e.target.value)} required />
                </div>
                <div>
                    <label className="form-label">كلمة المرور * (8 أحرف على الأقل)</label>
                    <div className="flex gap-2">
                        <input
                            className="form-input flex-1"
                            type={showPass ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => update('password', e.target.value)}
                            required
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} style={{ padding: '0 12px', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', color: 'var(--text-muted)' }}>
                            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: '0.8125rem', color: '#DC2626' }}>
                    {error}
                </div>
            )}

            <button
                type="submit"
                className="btn-primary w-full"
                style={{ fontSize: '0.9375rem', padding: '12px 24px', marginTop: 4 }}
                disabled={loading}
            >
                {loading ? 'جاري إنشاء المدرسة...' : 'إنشاء حساب المدرسة مجاناً'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.6875rem', color: 'var(--text-subtle)' }}>
                بالتسجيل توافق على شروط الاستخدام وسياسة الخصوصية
            </p>
        </form>
    )
}
