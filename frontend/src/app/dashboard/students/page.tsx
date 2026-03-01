import { createClient } from "@/lib/supabase/server"
import { fetchApi } from "@/lib/fetchApi"
import { redirect } from "next/navigation"
import { AddStudentModal } from "./AddStudentModal"
import { BulkImportModal } from "./BulkImportModal"
import { StudentEditModal } from "./StudentEditModal"
import Link from "next/link"
import { Search, Download, Users, Eye } from "lucide-react"

export default async function StudentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const schoolId = user?.user_metadata?.school_id || '00000000-0000-0000-0000-000000000000'
    let students: any[] = []
    try { students = await fetchApi('/students/') || [] } catch (e: any) { console.error(e?.message) }

    const gradeGroups = students.reduce((acc: Record<string, number>, s: any) => {
        const g = s.grade || 'غير محدد'
        acc[g] = (acc[g] || 0) + 1
        return acc
    }, {})

    return (
        <div className="space-y-5 page-enter">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="section-title">الطلاب</h1>
                    <p className="section-sub">{students.length} طالب مسجل في النظام</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="btn-secondary gap-1.5">
                        <Download className="h-4 w-4" />
                        تصدير
                    </button>
                    <BulkImportModal schoolId={schoolId} />
                    <AddStudentModal schoolId={schoolId} />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="card p-4 text-center">
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--blue-primary)' }}>{students.length}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>إجمالي الطلاب</p>
                </div>
                <div className="card p-4 text-center">
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>{Object.keys(gradeGroups).length}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>صف دراسي</p>
                </div>
                <div className="card p-4 text-center">
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7C3AED' }}>{students.filter((s: any) => s.email).length}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>لديهم بريد إلكتروني</p>
                </div>
                <div className="card p-4 text-center">
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D97706' }}>{students.filter((s: any) => s.enrollment_date).length}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>محدد تاريخ تسجيل</p>
                </div>
            </div>

            {/* Table Card */}
            <div className="card overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <div className="relative max-w-xs w-full">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--text-subtle)' }} />
                        <input
                            type="text"
                            placeholder="البحث في الطلاب..."
                            className="form-input"
                            style={{ paddingRight: '2.5rem' }}
                        />
                    </div>
                    <div className="flex items-center gap-2 mr-auto">
                        <span className="badge badge-blue">
                            <Users className="h-3 w-3 ml-1 inline" />
                            {students.length} طالب
                        </span>
                    </div>
                </div>

                {students.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                            <Users className="h-8 w-8" style={{ color: 'var(--blue-primary)' }} />
                        </div>
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>لا يوجد طلاب بعد</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 4 }}>ابدأ بإضافة طالب جديد</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>الطالب</th>
                                    <th>الصف</th>
                                    <th>الشعبة</th>
                                    <th>البريد الإلكتروني</th>
                                    <th>الهاتف</th>
                                    <th>تاريخ التسجيل</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student: any) => (
                                    <tr key={student.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                    style={{ background: 'var(--blue-primary)' }}
                                                >
                                                    {student.first_name?.[0]}{student.last_name?.[0]}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{student.first_name} {student.last_name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{student.grade || '—'}</td>
                                        <td>
                                            {student.section
                                                ? <span className="badge badge-blue">شعبة {student.section}</span>
                                                : <span style={{ color: 'var(--text-subtle)' }}>—</span>
                                            }
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{student.email || '—'}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{student.phone || '—'}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{student.enrollment_date || '—'}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/dashboard/students/${student.id}`}
                                                    className="flex items-center gap-1.5 text-xs font-medium"
                                                    style={{ color: 'var(--blue-primary)', textDecoration: 'none' }}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    عرض
                                                </Link>
                                                <StudentEditModal student={student} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
