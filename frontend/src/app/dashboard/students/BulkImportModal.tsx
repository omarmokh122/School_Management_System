'use client'

import { useState, useRef } from 'react'
import { Upload, Download, X, CheckCircle, AlertCircle, Loader2, Table2, FileSpreadsheet } from 'lucide-react'
import { useRouter } from 'next/navigation'

const COLUMNS = [
    { key: 'first_name', ar: 'الاسم الأول', required: true },
    { key: 'last_name', ar: 'الاسم الأخير', required: true },
    { key: 'grade', ar: 'الصف الدراسي' },
    { key: 'section', ar: 'الشعبة' },
    { key: 'email', ar: 'البريد الإلكتروني' },
    { key: 'phone', ar: 'رقم الهاتف' },
    { key: 'date_of_birth', ar: 'تاريخ الميلاد' },
    { key: 'enrollment_date', ar: 'تاريخ التسجيل' },
]

type Status = 'idle' | 'previewing' | 'uploading' | 'done' | 'error'
type ParsedRow = Record<string, string>
type ImportResult = { total: number; inserted: number; skipped: number; errors: any[] }

function parseCSV(text: string): ParsedRow[] {
    const lines = text.split(/\r?\n/).filter(Boolean)
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    return lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const row: ParsedRow = {}
        headers.forEach((h, i) => { row[h] = vals[i] || '' })
        return row
    })
}

export function BulkImportModal({ schoolId }: { schoolId: string }) {
    const [open, setOpen] = useState(false)
    const [status, setStatus] = useState<Status>('idle')
    const [previewRows, setPreviewRows] = useState<ParsedRow[]>([])
    const [fileName, setFileName] = useState('')
    const [fileObj, setFileObj] = useState<File | null>(null)
    const [result, setResult] = useState<ImportResult | null>(null)
    const [error, setError] = useState('')
    const fileRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const close = () => { setOpen(false); setStatus('idle'); setPreviewRows([]); setResult(null); setError('') }

    const handleFile = async (file: File) => {
        setFileName(file.name)
        setFileObj(file)
        setError('')

        // Client-side preview for CSV only
        if (file.name.toLowerCase().endsWith('.csv')) {
            const text = await file.text()
            const rows = parseCSV(text)
            setPreviewRows(rows.slice(0, 6))  // preview first 6 rows
        } else {
            setPreviewRows([])  // xlsx: no client preview
        }
        setStatus('previewing')
    }

    const handleImport = async () => {
        if (!fileObj) return
        setStatus('uploading')
        setError('')

        const form = new FormData()
        form.append('file', fileObj, fileObj.name)

        try {
            const res = await fetch('/api/students/bulk-import', { method: 'POST', body: form })
            const data = await res.json()
            if (!res.ok) {
                setError(data.detail || data.error || 'فشل الاستيراد')
                setStatus('error')
                return
            }
            setResult(data)
            setStatus('done')
            router.refresh()
        } catch {
            setError('تعذر الاتصال بالخادم')
            setStatus('error')
        }
    }

    const downloadTemplate = () => {
        window.open('/api/students/bulk-import/template', '_blank')
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="btn-secondary flex items-center gap-2"
                style={{ fontSize: '0.875rem', fontWeight: 600 }}
            >
                <FileSpreadsheet className="h-4 w-4" />
                استيراد من Excel
            </button>

            {open && (
                <div className="modal-overlay" onClick={close}>
                    <div className="modal-box" style={{ maxWidth: 680, width: '95vw' }} onClick={e => e.stopPropagation()} dir="rtl">
                        {/* Header */}
                        <div className="modal-header">
                            <h2 className="modal-title">استيراد الطلاب من Excel / CSV</h2>
                            <button onClick={close} className="modal-close"><X className="h-5 w-5" /></button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Template download */}
                            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#1E40AF' }}>تحميل النموذج الجاهز</p>
                                    <p style={{ fontSize: '0.75rem', color: '#3B82F6', marginTop: 2 }}>تأكد من مطابقة عناوين الأعمدة مع النموذج</p>
                                </div>
                                <button onClick={downloadTemplate} className="btn-primary" style={{ background: '#0056D2', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', padding: '8px 14px', whiteSpace: 'nowrap' }}>
                                    <Download className="h-4 w-4" /> تحميل النموذج
                                </button>
                            </div>

                            {/* File drop zone */}
                            {(status === 'idle' || status === 'error') && (
                                <div
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                                    onClick={() => fileRef.current?.click()}
                                    style={{ border: '2px dashed #CBD5E1', borderRadius: 12, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: '#F8FAFC' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0056D2'; (e.currentTarget as HTMLElement).style.background = '#EFF6FF' }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#CBD5E1'; (e.currentTarget as HTMLElement).style.background = '#F8FAFC' }}
                                >
                                    <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }}
                                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
                                    <Upload className="h-8 w-8 mx-auto mb-3" style={{ color: '#94A3B8' }} />
                                    <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>اسحب ملف CSV أو Excel أو انقر للاختيار</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>الصيغ المدعومة: .csv · .xlsx · .xls — حد أقصى 5000 طالب</p>
                                </div>
                            )}
                            {error && <p style={{ color: '#DC2626', fontSize: '0.8125rem' }}>{error}</p>}

                            {/* Preview table */}
                            {status === 'previewing' && (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Table2 className="h-4 w-4" style={{ color: '#059669' }} />
                                            معاينة الملف: <span style={{ color: '#059669' }}>{fileName}</span>
                                        </p>
                                        <button onClick={() => { setStatus('idle'); setPreviewRows([]); setFileObj(null) }}
                                            style={{ fontSize: '0.75rem', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                                            إزالة الملف
                                        </button>
                                    </div>

                                    {previewRows.length > 0 ? (
                                        <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                                            <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ background: '#F8FAFC' }}>
                                                        {COLUMNS.map(c => (
                                                            <th key={c.key} style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap' }}>
                                                                {c.ar}{c.required && <span style={{ color: '#DC2626' }}>*</span>}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {previewRows.map((row, i) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                            {COLUMNS.map(c => (
                                                                <td key={c.key} style={{ padding: '7px 12px', color: 'var(--text-primary)' }}>{row[c.ar] || row[c.key] || '—'}</td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <p style={{ padding: '6px 12px', fontSize: '0.6875rem', color: 'var(--text-muted)', background: '#F8FAFC' }}>تظهر أول {previewRows.length} صفوف فقط للمعاينة</p>
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', padding: '10px 0' }}>ملف Excel المحدد — المعاينة غير متاحة. سيتم رفع الملف وقراءته في الخادم.</p>
                                    )}

                                    <button onClick={handleImport} className="btn-primary w-full mt-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <Upload className="h-4 w-4" /> استيراد الطلاب الآن
                                    </button>
                                </div>
                            )}

                            {/* Uploading spinner */}
                            {status === 'uploading' && (
                                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3" style={{ color: '#0056D2' }} />
                                    <p style={{ fontWeight: 600 }}>جاري قراءة الملف واستيراد الطلاب...</p>
                                </div>
                            )}

                            {/* Result summary */}
                            {status === 'done' && result && (
                                <div className="space-y-3">
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                                        {[
                                            { label: 'الإجمالي', value: result.total, color: '#0056D2', bg: '#EFF6FF' },
                                            { label: 'تم الإضافة', value: result.inserted, color: '#059669', bg: '#F0FDF4' },
                                            { label: 'تم التخطي', value: result.skipped, color: '#D97706', bg: '#FFFBEB' },
                                        ].map(s => (
                                            <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                                                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</p>
                                                <p style={{ fontSize: '0.75rem', color: s.color, marginTop: 2 }}>{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    {result.errors.length > 0 && (
                                        <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '12px 14px', border: '1px solid #FECACA' }}>
                                            <p style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#DC2626', marginBottom: 8 }}>الصفوف التي بها أخطاء:</p>
                                            {result.errors.map((e, i) => (
                                                <p key={i} style={{ fontSize: '0.75rem', color: '#991B1B' }}>الصف {e.row}: {e.reason}</p>
                                            ))}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                        <button onClick={close} className="btn-primary">إغلاق</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
