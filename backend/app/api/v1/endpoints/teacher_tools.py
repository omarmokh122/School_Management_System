from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from app.api import dependencies
from app.schemas.teacher_tools import TeacherToolRequest, TeacherToolResponse
from app.core.config import settings
import openai

router = APIRouter()


def get_openai_client():
    if not settings.OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="OpenAI API key is not configured.")
    return openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


def _curriculum_section(curriculum_context: Optional[str]) -> str:
    """Build a curriculum reference block to prepend to any prompt."""
    if not curriculum_context:
        return ""
    # Truncate to ~3000 chars to stay within token limits
    truncated = curriculum_context[:3000]
    if len(curriculum_context) > 3000:
        truncated += "\n... [تم اختصار المنهج]"
    return f"""
--- المنهج الدراسي المرفوع ---
{truncated}
--- نهاية المنهج ---

بناءً على المنهج الدراسي أعلاه، """


PROMPTS = {
    "lesson_plan": lambda r: f"""
أنت معلم خبير ومتخصص في إعداد خطط الدروس. قم بإنشاء خطة درس احترافية وشاملة باللغة العربية.

المعطيات:
- الموضوع: {r.topic}
- الصف الدراسي: {r.grade}
- المادة: {r.subject or 'غير محدد'}
- الأهداف التعليمية: {r.objectives or 'إتقان الموضوع وفهمه'}
- ملاحظات إضافية: {r.additional_notes or 'لا يوجد'}

قم بإنشاء خطة درس تحتوي على:
1. أهداف الدرس (عامة وخاصة)
2. المواد والأدوات المطلوبة
3. التهيئة والتمهيد (5 دقائق)
4. خطوات تنفيذ الدرس مع التوقيت
5. أنشطة الطلاب
6. التقييم والتغذية الراجعة
7. الواجب المنزلي (إن وجد)

استخدم تنسيقاً واضحاً ومنظماً.
""",

    "quiz": lambda r: f"""
أنت معلم خبير في إنشاء الاختبارات التعليمية. قم بإنشاء اختبار تعليمي احترافي باللغة العربية.

المعطيات:
- الموضوع: {r.topic}
- الصف الدراسي: {r.grade}
- المادة: {r.subject or 'غير محدد'}
- عدد الأسئلة: {r.num_questions}
- مستوى الصعوبة: {r.difficulty}
- الأهداف: {r.objectives or 'قياس الفهم العام'}

قم بإنشاء الاختبار ويشمل:
1. أسئلة اختيار من متعدد (نصف الأسئلة)
2. أسئلة صواب وخطأ
3. أسئلة قصيرة/مقالية
4. مفتاح الإجابات الكاملة في النهاية

رقّم الأسئلة بوضوح واجعل كل سؤال واضحاً ومحدداً.
""",

    "student_report": lambda r: f"""
أنت مستشار تعليمي خبير في كتابة تقارير الطلاب. قم بكتابة تقرير تقدم طالب احترافي باللغة العربية.

معلومات الطالب:
- اسم الطالب: {r.student_name}
- الصف: {r.grade}
- المادة: {r.subject or 'عام'}
- نقاط القوة: {r.strengths or 'يبذل جهداً مناسباً'}
- مجالات التحسين: {r.areas_to_improve or 'تحتاج إلى متابعة'}
- ملاحظات إضافية: {r.additional_notes or 'لا يوجد'}

قم بكتابة تقرير يشمل:
1. نظرة عامة على أداء الطالب
2. نقاط القوة والإيجابيات
3. المجالات التي تحتاج تطوير
4. توصيات للطالب وأولياء الأمور
5. خاتمة تشجيعية

استخدم أسلوباً مهنياً ومحفزاً.
""",

    "parent_email": lambda r: f"""
أنت مساعد تواصل مهني في المدارس. قم بصياغة رسالة احترافية لولي الأمر باللغة العربية.

معلومات الرسالة:
- اسم ولي الأمر: {r.parent_name or 'ولي الأمر الكريم'}
- اسم الطالب: {r.student_name}
- الموضوع/المشكلة: {r.student_issue}
- الصف: {r.grade}
- ملاحظات إضافية: {r.additional_notes or 'لا يوجد'}

قم بصياغة رسالة تشمل:
1. التحية والمقدمة
2. موضوع الرسالة بأسلوب واضح ومهني
3. التفاصيل والملاحظات
4. المطلوب من ولي الأمر
5. خاتمة مهذبة مع بيانات التواصل

استخدم أسلوباً محترماً ومشجعاً على التعاون.
""",

    "differentiate": lambda r: f"""
أنت متخصص في التعليم المتمايز وتكييف المحتوى التعليمي. قم بتكييف المحتوى التالي باللغة العربية.

المحتوى الأصلي:
{r.content}

المتطلبات:
- مستوى القراءة المستهدف: {r.reading_level}
- الصف الدراسي: {r.grade}
- اللغة: {r.language}
- ملاحظات: {r.additional_notes or 'لا يوجد'}

قم بتقديم:
1. نسخة مبسطة (للطلاب ذوي صعوبات التعلم)
2. نسخة متوسطة (للمستوى العادي)
3. نسخة متقدمة (للطلاب المتفوقين)
4. أسئلة فهم لكل مستوى

احتفظ بنفس المحتوى الرئيسي مع تعديل المستوى اللغوي والتعقيد.
""",
}


@router.post("/teacher-tools", response_model=TeacherToolResponse)
async def teacher_ai_tool(
    request: TeacherToolRequest,
    _user = Depends(dependencies.get_current_user),
    _role = Depends(dependencies.require_role(["Teacher", "Admin", "SuperAdmin"])),
):
    """AI-powered teacher tools: lesson plans, quizzes, reports, parent emails, content differentiation."""
    client = get_openai_client()

    prompt_fn = PROMPTS.get(request.tool)
    if not prompt_fn:
        raise HTTPException(status_code=400, detail=f"Unknown tool: {request.tool}. Valid: {list(PROMPTS.keys())}")

    prompt = prompt_fn(request)

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "أنت مساعد ذكاء اصطناعي متخصص في التعليم. "
                        "تقدم محتوى تعليمياً عالي الجودة باللغة العربية. "
                        "اجعل الإخراج منظماً وقابلاً للاستخدام مباشرة في الفصل الدراسي."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000,
        )
        result_text = response.choices[0].message.content or ""
        return TeacherToolResponse(result=result_text, tool=request.tool)
    except openai.AuthenticationError:
        raise HTTPException(status_code=401, detail="OpenAI API key is invalid.")
    except openai.RateLimitError:
        raise HTTPException(status_code=429, detail="OpenAI rate limit reached. Please try again in a moment.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")
