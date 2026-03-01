'use client'

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, padding: 32 }}>
            <div style={{ fontSize: '3rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>تعذر تحميل البيانات</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: 400, textAlign: 'center', lineHeight: 1.6 }}>
                {error.message?.includes('Backend server is not running')
                    ? 'خادم الواجهة الخلفية غير متاح حالياً. تأكد من تشغيل الخادم على المنفذ 8000.'
                    : 'حدث خطأ أثناء تحميل البيانات. تحقق من اتصالك وحاول مجدداً.'}
            </p>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'monospace', background: '#F8FAFC', padding: '8px 14px', borderRadius: 8, maxWidth: 500, wordBreak: 'break-all' }}>
                {error.message}
            </div>
            <button
                onClick={reset}
                style={{ marginTop: 8, padding: '10px 24px', background: '#0056D2', color: '#fff', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}
            >
                إعادة المحاولة
            </button>
        </div>
    )
}
