'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, FileText, X, CheckCircle, Loader2, Trash2 } from 'lucide-react'

interface Props {
    classId: string
    className: string
    onCurriculumLoaded: (text: string, className: string) => void
    onCurriculumCleared: () => void
}

export function CurriculumUpload({ classId, className, onCurriculumLoaded, onCurriculumCleared }: Props) {
    const [state, setState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
    const [fileName, setFileName] = useState<string>('')
    const [charCount, setCharCount] = useState<number>(0)
    const [error, setError] = useState<string>('')
    const fileRef = useRef<HTMLInputElement>(null)

    // On mount, check if curriculum already exists for this class
    useEffect(() => {
        fetch(`/api/academic/curriculum/${classId}`)
            .then(r => r.json())
            .then(data => {
                if (data.found) {
                    setFileName(data.file_name || 'المنهج')
                    setCharCount(data.char_count || 0)
                    setState('done')
                    onCurriculumLoaded(data.content, className)
                }
            })
            .catch(() => { })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId])

    const handleFile = async (file: File) => {
        setState('uploading')
        setError('')
        const form = new FormData()
        form.append('file', file)
        try {
            const res = await fetch(`/api/academic/curriculum/upload/${classId}`, {
                method: 'POST',
                body: form,
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || data.detail || 'فشل الرفع')
                setState('error')
                return
            }
            setFileName(data.file_name || file.name)
            setCharCount(data.char_count || 0)
            setState('done')
            // Fetch full content for AI context
            const full = await fetch(`/api/academic/curriculum/${classId}`).then(r => r.json())
            onCurriculumLoaded(full.content || '', className)
        } catch {
            setError('تعذر الاتصال بالخادم')
            setState('error')
        }
    }

    const handleDelete = async () => {
        await fetch(`/api/academic/curriculum/${classId}`, { method: 'DELETE' })
        setState('idle')
        setFileName('')
        setCharCount(0)
        onCurriculumCleared()
    }

    const drop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }

    if (state === 'done') {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10 }}>
                <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#059669' }} />
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#065F46' }}>{fileName}</p>
                    <p style={{ fontSize: '0.6875rem', color: '#64748b' }}>{charCount.toLocaleString()} حرف مستخرج</p>
                </div>
                <button onClick={handleDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 4 }}>
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        )
    }

    return (
        <div>
            <div
                onDragOver={e => e.preventDefault()}
                onDrop={drop}
                onClick={() => fileRef.current?.click()}
                style={{
                    border: '1.5px dashed #CBD5E1', borderRadius: 10, padding: '14px',
                    textAlign: 'center', cursor: 'pointer', background: '#F8FAFC',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'border-color .2s, background .2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0056D2'; (e.currentTarget as HTMLElement).style.background = '#EFF6FF' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#CBD5E1'; (e.currentTarget as HTMLElement).style.background = '#F8FAFC' }}
            >
                <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
                {state === 'uploading' ? (
                    <><Loader2 className="h-5 w-5 animate-spin" style={{ color: '#0056D2' }} /><p style={{ fontSize: '0.75rem', color: '#0056D2' }}>جاري استخراج النص...</p></>
                ) : (
                    <><Upload className="h-5 w-5" style={{ color: '#64748b' }} /><p style={{ fontSize: '0.75rem', color: '#64748b' }}>اسحب ملف PDF أو DOCX أو انقر للرفع</p></>
                )}
            </div>
            {state === 'error' && <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: 6 }}>{error}</p>}
        </div>
    )
}
