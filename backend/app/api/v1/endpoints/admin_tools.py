from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.api import dependencies
from app.core.config import settings
import openai

router = APIRouter()


class AdminToolRequest(BaseModel):
    tool: str   # email | report | agenda | planning | template
    # Email tool
    recipient_type: str = ""   # parents | teacher | ministry | supplier
    email_subject: str = ""
    key_points: str = ""
    tone: str = "رسمي"
    # Report tool
    report_period: str = ""   # e.g. January 2025
    activities: str = ""
    achievements: str = ""
    challenges: str = ""
    # Agenda tool
    meeting_title: str = ""
    attendees: str = ""
    topics: str = ""
    duration: str = "60 دقيقة"
    meeting_notes: str = ""   # raw notes → generate formatted minutes
    # Planning tool
    week_goals: str = ""
    team_size: str = ""
    constraints: str = ""
    # Template tool
    template_type: str = ""  # leave_request | parent_consent | warning_letter | certificate | policy
    school_name: str = ""
    custom_fields: str = ""
    # Shared
    additional_notes: str = ""


class AdminToolResponse(BaseModel):
    result: str
    tool: str


def get_openai_client():
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="OpenAI API key is not configured.")
    return openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


PROMPTS = {
    "email": lambda r: f"""
أنت متخصص في الاتصالات المؤسسية للمدارس. قم بصياغة بريد إلكتروني رسمي واحترافي باللغة العربية.

تفاصيل الرسالة:
- المستلم: {r.recipient_type or 'غير محدد'}
- موضوع الرسالة: {r.email_subject}
- النقاط الأساسية التي يجب تضمينها: {r.key_points}
- الأسلوب المطلوب: {r.tone}
- ملاحظات إضافية: {r.additional_notes or 'لا يوجد'}

قم بصياغة رسالة بريد إلكتروني تحتوي على:
1. سطر الموضوع (Subject)
2. التحية الرسمية المناسبة
3. المقدمة
4. صلب الرسالة مع جميع النقاط المطلوبة
5. الإجراء المطلوب من المستلم (إن وجد)
6. الخاتمة الرسمية
7. التوقيع الرسمي (مدير المدرسة / الإدارة)

استخدم أسلوباً رسمياً محترفاً مناسباً للمؤسسات التعليمية.
""",

    "report": lambda r: f"""
أنت خبير في إعداد التقارير الإدارية للمدارس. قم بإعداد تقرير إداري شهري احترافي باللغة العربية.

بيانات التقرير:
- الفترة الزمنية: {r.report_period}
- الأنشطة والمهام المنجزة: {r.activities}
- الإنجازات والنتائج: {r.achievements}
- التحديات والعقبات: {r.challenges or 'لا يوجد'}
- ملاحظات إضافية: {r.additional_notes or 'لا يوجد'}

قم بإعداد تقرير إداري يشمل:
1. غلاف التقرير (العنوان، الفترة، التاريخ)
2. ملخص تنفيذي (فقرة واحدة)
3. الأنشطة والفعاليات المنجزة (مرتبة ومنظمة)
4. الإنجازات والمؤشرات الرئيسية
5. التحديات والحلول المقترحة
6. الخطوات والتوصيات للفترة القادمة
7. خاتمة رسمية

استخدم جداول وتنسيقاً واضحاً يسهّل القراءة.
""",

    "agenda": lambda r: f"""
أنت خبير في إدارة الاجتماعات المؤسسية. {'قم بصياغة محضر اجتماع رسمي' if r.meeting_notes else 'قم بإعداد جدول أعمال اجتماع احترافي'} باللغة العربية.

{"ملاحظات الاجتماع:" + chr(10) + r.meeting_notes if r.meeting_notes else f'''تفاصيل الاجتماع:
- عنوان الاجتماع: {r.meeting_title}
- الحضور: {r.attendees}
- محاور النقاش: {r.topics}
- المدة الزمنية: {r.duration}
- ملاحظات: {r.additional_notes or "لا يوجد"}'''}

{'قم بتحويل الملاحظات أعلاه إلى محضر اجتماع رسمي يشمل: رأس المحضر (التاريخ، الحضور، المكان)، ملخص كل نقطة نقاش، القرارات المتخذة، المهام والمسؤوليات، موعد الاجتماع القادم، وتوقيع رئيس الاجتماع والكاتب.' if r.meeting_notes else '''قم بإعداد جدول أعمال يشمل:
1. رأس الجدول (عنوان الاجتماع، التاريخ، المكان، الحضور)
2. البنود المطلوبة مرتبة بالوقت المخصص لكل بند
3. نقاط النقاش لكل بند
4. المسؤول عن تقديم كل موضوع
5. ملاحظة ختامية حول التوثيق والمتابعة'''}
""",

    "planning": lambda r: f"""
أنت خبير في التخطيط الإداري للمؤسسات التعليمية. قم بإعداد خطة عمل أسبوعية احترافية باللغة العربية.

معلومات التخطيط:
- أهداف الأسبوع: {r.week_goals}
- حجم الفريق أو عدد الموظفين: {r.team_size or 'غير محدد'}
- القيود والملاحظات: {r.constraints or 'لا يوجد'}
- ملاحظات إضافية: {r.additional_notes or 'لا يوجد'}

قم بإعداد خطة عمل أسبوعية شاملة تتضمن:
1. ملخص أهداف الأسبوع
2. جدول العمل اليومي (الأحد إلى الخميس) مع المهام والمسؤوليات
3. الاجتماعات والفعاليات المقترحة
4. مؤشرات النجاح والإنجاز
5. خطة احتياطية للطوارئ
6. تذكيرات ومواعيد نهائية مهمة

استخدم جدولاً منظماً يسهّل المتابعة اليومية.
""",

    "template": lambda r: f"""
أنت خبير في إعداد النماذج والوثائق الرسمية للمؤسسات التعليمية. قم بإنشاء نموذج رسمي باللغة العربية.

تفاصيل النموذج:
- نوع النموذج: {r.template_type}
- اسم المدرسة: {r.school_name or 'مدرسة [اسم المدرسة]'}
- الحقول الإضافية المطلوبة: {r.custom_fields or 'لا يوجد'}
- ملاحظات: {r.additional_notes or 'لا يوجد'}

قم بإنشاء نموذج رسمي احترافي يشمل:
1. رأس النموذج (شعار المدرسة placeholder، الاسم، التاريخ، الرقم المرجعي)
2. عنوان النموذج الرسمي
3. جميع الحقول اللازمة بشكل واضح ومنظم
4. قسم التوقيعات والموافقات
5. ملاحظات قانونية أو إدارية (إن وجدت)
6. تذييل النموذج

اجعل النموذج جاهزاً للطباعة والاستخدام المباشر.
""",
}


@router.post("/admin-tools", response_model=AdminToolResponse)
async def admin_ai_tool(
    request: AdminToolRequest,
    _user=Depends(dependencies.get_current_user),
    _role=Depends(dependencies.require_role(["Admin", "SuperAdmin"])),
):
    """AI-powered admin tools: emails, reports, agendas, planning, templates."""
    client = get_openai_client()
    prompt_fn = PROMPTS.get(request.tool)
    if not prompt_fn:
        raise HTTPException(status_code=400, detail=f"Unknown tool: {request.tool}")

    prompt = prompt_fn(request)
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "أنت مساعد ذكاء اصطناعي متخصص في الإدارة المدرسية الاحترافية. "
                        "تقدم وثائق وتقارير ورسائل رسمية عالية الجودة باللغة العربية الفصحى. "
                        "المخرجات يجب أن تكون جاهزة للاستخدام المؤسسي المباشر."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=2500,
        )
        result_text = response.choices[0].message.content or ""
        return AdminToolResponse(result=result_text, tool=request.tool)
    except openai.AuthenticationError:
        raise HTTPException(status_code=401, detail="OpenAI API key is invalid.")
    except openai.RateLimitError:
        raise HTTPException(status_code=429, detail="OpenAI rate limit reached.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
