import { Mail, Phone, GraduationCap } from "lucide-react"
import { fetchApi } from "@/lib/fetchApi"
import { createClient } from "@/lib/supabase/server"
import { AddTeacherModal } from "./AddTeacherModal"
import { TeacherEditModal } from "./TeacherEditModal"
import { CreateAccountModal } from "./CreateAccountModal"
import { redirect } from "next/navigation"

export default async function TeachersPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const schoolId = user?.user_metadata?.school_id || '00000000-0000-0000-0000-000000000000'
    let teachers: any[] = []
    try { teachers = await fetchApi('/teachers/') || [] } catch (e: any) { console.error(e?.message) }

    return (
        <div className="space-y-5 page-enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="section-title">المعلمون</h1>
                    <p className="section-sub">{teachers.length} معلم في الهيئة التدريسية</p>
                </div>
                <AddTeacherModal schoolId={schoolId} />
            </div>

            {teachers.length === 0 ? (
                <div className="card py-20 text-center">
                    <div className="h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                        <GraduationCap className="h-8 w-8" style={{ color: 'var(--blue-primary)' }} />
                    </div>
                    <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>لا يوجد معلمون مسجلون بعد</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 4 }}>ابدأ بإضافة معلم جديد</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {teachers.map((teacher: any) => (
                        <div key={teacher.id} className="card p-5 flex flex-col gap-4 relative group">
                            {/* Edit button */}
                            <div className="absolute top-4 left-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CreateAccountModal
                                    teacherId={teacher.id}
                                    teacherName={`${teacher.first_name} ${teacher.last_name}`}
                                />
                                <TeacherEditModal teacher={teacher} />
                            </div>

                            {/* Avatar */}
                            <div className="flex flex-col items-center gap-3 pb-4" style={{ borderBottom: '1px solid #F3F4F6' }}>
                                {teacher.avatar_url ? (
                                    <img
                                        src={teacher.avatar_url}
                                        alt=""
                                        className="h-20 w-20 rounded-full object-cover"
                                        style={{ border: '3px solid #EFF6FF' }}
                                    />
                                ) : (
                                    <div
                                        className="h-20 w-20 rounded-full flex items-center justify-center text-white"
                                        style={{
                                            background: 'linear-gradient(135deg, var(--blue-primary), #7C3AED)',
                                            fontSize: '1.25rem',
                                            fontWeight: 800,
                                        }}
                                    >
                                        {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                                    </div>
                                )}
                                <div className="text-center">
                                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                                        {teacher.first_name} {teacher.last_name}
                                    </p>
                                    <span className="badge badge-blue mt-1">{teacher.specialization || 'بدون تخصص'}</span>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="space-y-2">
                                {teacher.email && (
                                    <div className="flex items-center gap-2.5" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                        <Mail className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--text-subtle)' }} />
                                        <span className="truncate">{teacher.email}</span>
                                    </div>
                                )}
                                {teacher.phone && (
                                    <div className="flex items-center gap-2.5" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                        <Phone className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--text-subtle)' }} />
                                        <span>{teacher.phone}</span>
                                    </div>
                                )}
                                {!teacher.email && !teacher.phone && (
                                    <p style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', textAlign: 'center' }}>لا توجد بيانات تواصل</p>
                                )}
                            </div>

                            {teacher.hire_date && (
                                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #F3F4F6', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)' }}>
                                        تاريخ التعيين: {teacher.hire_date}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
