'use client'

import { useState } from 'react'
import {
    School, User, Shield, Bell, Globe, Palette,
    Save, Check, ChevronRight, Building2, BookOpen, DollarSign
} from 'lucide-react'

const TABS = [
    { id: 'school', label: 'بيانات المدرسة', icon: Building2 },
    { id: 'academic', label: 'الإعدادات الأكاديمية', icon: BookOpen },
    { id: 'finance', label: 'الرسوم والمالية', icon: DollarSign },
    { id: 'account', label: 'الحساب الشخصي', icon: User },
    { id: 'security', label: 'الأمان', icon: Shield },
]

const GRADES_SYSTEM = ['نظام المعدل (GPA)', 'نظام النسبة المئوية', 'نظام الحروف (A-F)']
const CURRENCIES = ['دولار أمريكي (USD)', 'يورو (EUR)', 'دينار كويتي (KWD)', 'درهم إماراتي (AED)', 'ريال سعودي (SAR)', 'جنيه مصري (EGP)']
const SEMESTERS = ['فصلان دراسيان', 'ثلاثة فصول دراسية', 'أربعة فصول']

interface Props { schoolId: string; userRole: string; school: any; user: any }

export function SettingsClient({ schoolId, userRole, school, user }: Props) {
    const [activeTab, setActiveTab] = useState('school')
    const [saved, setSaved] = useState(false)

    const [schoolForm, setSchoolForm] = useState({
        name: school?.name || '',
        email: school?.email || '',
        phone: school?.phone || '',
        address: school?.address || '',
        website: school?.website || '',
        logo_url: school?.logo_url || '',
        description: school?.description || '',
    })

    const [academicForm, setAcademicForm] = useState({
        academic_year: '2025-2026',
        semester_system: SEMESTERS[0],
        grading_system: GRADES_SYSTEM[0],
        passing_grade: '60',
        school_start_time: '07:30',
        school_end_time: '14:00',
        period_duration: '45',
    })

    const [financeForm, setFinanceForm] = useState({
        currency: CURRENCIES[0],
        late_fee_pct: '5',
        invoice_prefix: 'INV',
        payment_methods: 'كاش, تحويل بنكي, بطاقة ائتمانية',
    })

    const handleSave = () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
    }

    const inputCls = "form-input"
    const labelCls = "form-label"

    return (
        <div className="space-y-5 page-enter">
            <div>
                <h1 className="section-title">الإعدادات</h1>
                <p className="section-sub">إدارة إعدادات المدرسة والنظام</p>
            </div>

            <div className="flex gap-6 flex-col lg:flex-row">
                {/* Sidebar Tabs */}
                <div className="lg:w-56 flex-shrink-0">
                    <div className="card p-2 space-y-0.5">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-right transition-all"
                                style={{
                                    background: activeTab === tab.id ? 'var(--blue-light)' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--blue-primary)' : 'var(--text-muted)',
                                    fontWeight: activeTab === tab.id ? '700' : '500',
                                    fontFamily: 'inherit',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                <tab.icon className="h-4 w-4 flex-shrink-0" />
                                <span className="flex-1">{tab.label}</span>
                                {activeTab === tab.id && <ChevronRight className="h-3.5 w-3.5 rotate-180" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    {/* School Info */}
                    {activeTab === 'school' && (
                        <div className="card p-6 space-y-5">
                            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Building2 className="h-5 w-5" style={{ color: 'var(--blue-primary)' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>بيانات المدرسة</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>المعلومات الأساسية للمدرسة</p>
                                </div>
                            </div>

                            {/* Logo Preview */}
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-xl bg-white border-2 border-dashed flex items-center justify-center flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
                                    {schoolForm.logo_url
                                        ? <img src={schoolForm.logo_url} alt="Logo" className="h-full w-full rounded-xl object-contain" />
                                        : <School className="h-7 w-7" style={{ color: '#D1D5DB' }} />
                                    }
                                </div>
                                <div className="flex-1">
                                    <label className={labelCls}>رابط شعار المدرسة</label>
                                    <input className={inputCls} placeholder="https://example.com/logo.png"
                                        value={schoolForm.logo_url} onChange={e => setSchoolForm(f => ({ ...f, logo_url: e.target.value }))} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>اسم المدرسة *</label>
                                    <input className={inputCls} placeholder="مدرسة بيروت الدولية"
                                        value={schoolForm.name} onChange={e => setSchoolForm(f => ({ ...f, name: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>البريد الإلكتروني</label>
                                    <input type="email" className={inputCls} placeholder="info@school.com"
                                        value={schoolForm.email} onChange={e => setSchoolForm(f => ({ ...f, email: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>رقم الهاتف</label>
                                    <input className={inputCls} placeholder="+961 1 000 000"
                                        value={schoolForm.phone} onChange={e => setSchoolForm(f => ({ ...f, phone: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>الموقع الإلكتروني</label>
                                    <input className={inputCls} placeholder="https://school.com"
                                        value={schoolForm.website} onChange={e => setSchoolForm(f => ({ ...f, website: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className={labelCls}>العنوان</label>
                                <input className={inputCls} placeholder="شارع الحمرا، بيروت، لبنان"
                                    value={schoolForm.address} onChange={e => setSchoolForm(f => ({ ...f, address: e.target.value }))} />
                            </div>
                            <div>
                                <label className={labelCls}>نبذة عن المدرسة</label>
                                <textarea className={inputCls} rows={3} style={{ resize: 'vertical' }}
                                    placeholder="وصف مختصر عن المدرسة وفلسفتها التعليمية..."
                                    value={schoolForm.description} onChange={e => setSchoolForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                        </div>
                    )}

                    {/* Academic Settings */}
                    {activeTab === 'academic' && (
                        <div className="card p-6 space-y-5">
                            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: '#F5F3FF' }}>
                                    <BookOpen className="h-5 w-5" style={{ color: '#7C3AED' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>الإعدادات الأكاديمية</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>الجدول الزمني ونظام التقييم</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>العام الدراسي</label>
                                    <input className={inputCls} placeholder="2025-2026"
                                        value={academicForm.academic_year} onChange={e => setAcademicForm(f => ({ ...f, academic_year: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>نظام الفصول الدراسية</label>
                                    <select className={inputCls} value={academicForm.semester_system} onChange={e => setAcademicForm(f => ({ ...f, semester_system: e.target.value }))}>
                                        {SEMESTERS.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>نظام التقييم</label>
                                    <select className={inputCls} value={academicForm.grading_system} onChange={e => setAcademicForm(f => ({ ...f, grading_system: e.target.value }))}>
                                        {GRADES_SYSTEM.map(g => <option key={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>درجة النجاح (%)</label>
                                    <input type="number" min={0} max={100} className={inputCls}
                                        value={academicForm.passing_grade} onChange={e => setAcademicForm(f => ({ ...f, passing_grade: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>وقت بداية الدوام</label>
                                    <input type="time" className={inputCls}
                                        value={academicForm.school_start_time} onChange={e => setAcademicForm(f => ({ ...f, school_start_time: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>وقت انتهاء الدوام</label>
                                    <input type="time" className={inputCls}
                                        value={academicForm.school_end_time} onChange={e => setAcademicForm(f => ({ ...f, school_end_time: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>مدة الحصة (دقيقة)</label>
                                    <select className={inputCls} value={academicForm.period_duration} onChange={e => setAcademicForm(f => ({ ...f, period_duration: e.target.value }))}>
                                        <option value="40">40 دقيقة</option>
                                        <option value="45">45 دقيقة</option>
                                        <option value="50">50 دقيقة</option>
                                        <option value="60">60 دقيقة</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Finance Settings */}
                    {activeTab === 'finance' && (
                        <div className="card p-6 space-y-5">
                            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: '#F0FDF4' }}>
                                    <DollarSign className="h-5 w-5" style={{ color: '#059669' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>الإعدادات المالية</h3>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>العملة والرسوم وطرق الدفع</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>العملة الافتراضية</label>
                                    <select className={inputCls} value={financeForm.currency} onChange={e => setFinanceForm(f => ({ ...f, currency: e.target.value }))}>
                                        {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>غرامة التأخر (%)</label>
                                    <input type="number" min={0} max={50} className={inputCls}
                                        value={financeForm.late_fee_pct} onChange={e => setFinanceForm(f => ({ ...f, late_fee_pct: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>بادئة رقم الفاتورة</label>
                                    <input className={inputCls} placeholder="INV"
                                        value={financeForm.invoice_prefix} onChange={e => setFinanceForm(f => ({ ...f, invoice_prefix: e.target.value }))} />
                                </div>
                                <div>
                                    <label className={labelCls}>طرق الدفع المقبولة</label>
                                    <input className={inputCls} placeholder="كاش, تحويل بنكي..."
                                        value={financeForm.payment_methods} onChange={e => setFinanceForm(f => ({ ...f, payment_methods: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Account */}
                    {activeTab === 'account' && (
                        <div className="card p-6 space-y-5">
                            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                                    <User className="h-5 w-5" style={{ color: 'var(--blue-primary)' }} />
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>الحساب الشخصي</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>البريد الإلكتروني</label>
                                    <input className={inputCls} disabled value={user?.email || ''} style={{ opacity: 0.6 }} />
                                </div>
                                <div>
                                    <label className={labelCls}>الدور الوظيفي</label>
                                    <input className={inputCls} disabled value={user?.user_metadata?.role || 'Admin'} style={{ opacity: 0.6 }} />
                                </div>
                            </div>
                            <div className="rounded-xl p-4" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                                <p style={{ fontSize: '0.8125rem', color: '#92400E', fontWeight: 600 }}>⚠️ تغيير كلمة المرور</p>
                                <p style={{ fontSize: '0.75rem', color: '#B45309', marginTop: 4 }}>لتغيير كلمة المرور، أرسل طلب إعادة تعيين من صفحة تسجيل الدخول.</p>
                            </div>
                        </div>
                    )}

                    {/* Security */}
                    {activeTab === 'security' && (
                        <div className="card p-6 space-y-4">
                            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                                <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: '#FEF2F2' }}>
                                    <Shield className="h-5 w-5" style={{ color: '#DC2626' }} />
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>الأمان</h3>
                            </div>
                            {[
                                { label: 'المصادقة الثنائية (2FA)', desc: 'أضف طبقة حماية إضافية لحسابك', enabled: false },
                                { label: 'تنبيهات تسجيل الدخول', desc: 'إشعار عند تسجيل دخول من جهاز جديد', enabled: true },
                                { label: 'حماية الجلسة', desc: 'تسجيل خروج تلقائي بعد 30 دقيقة من الخمول', enabled: true },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.label}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</p>
                                    </div>
                                    <div
                                        style={{
                                            width: 44, height: 24, borderRadius: 12,
                                            background: item.enabled ? 'var(--blue-primary)' : '#D1D5DB',
                                            position: 'relative', cursor: 'pointer', transition: 'background .2s',
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute', top: 2,
                                            right: item.enabled ? 22 : 2,
                                            width: 20, height: 20, borderRadius: '50%',
                                            background: 'white', transition: 'right .2s',
                                            boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Save Button */}
                    {['school', 'academic', 'finance'].includes(activeTab) && (
                        <div className="flex justify-end pt-2">
                            <button
                                className="btn-primary"
                                onClick={handleSave}
                                style={saved ? { background: '#059669' } : {}}
                            >
                                {saved ? <><Check className="h-4 w-4" /> تم الحفظ</> : <><Save className="h-4 w-4" /> حفظ الإعدادات</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
