from fastapi import APIRouter, Depends, HTTPException
from app.api import dependencies
from app.schemas.ai import (
    ScheduleGenerationRequest, ScheduleGenerationResponse,
    MessageDraftRequest, MessageDraftResponse
)
from app.core.config import settings
import openai

router = APIRouter()

def get_openai_client():
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=503, 
            detail="OpenAI API key is not configured on the server."
        )
    return openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

@router.post("/schedule", response_model=ScheduleGenerationResponse)
async def generate_schedule(
    request: ScheduleGenerationRequest,
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "SuperAdmin"]))
):
    client = get_openai_client()
    
    prompt = f"""
    You are an expert school administrator AI.
    Generate a weekly class schedule based on these requirements:
    - Subjects: {', '.join(request.subjects)}
    - Max hours per day: {request.max_hours_per_day}
    - Days per week: {request.days_per_week}
    - Additional Constraints: {request.additional_constraints or 'None'}
    
    Return the schedule formatted as a clear Markdown table.
    """
    
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates school schedules in Arabic."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        return ScheduleGenerationResponse(schedule=response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/draft-message", response_model=MessageDraftResponse)
async def draft_message(
    request: MessageDraftRequest,
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin", "SuperAdmin"]))
):
    client = get_openai_client()
    
    prompt = f"""
    Draft a professional message in Arabic for a school manager to send.
    - Topic: {request.topic}
    - Tone: {request.tone}
    - Target Audience: {request.audience}
    - Additional Context: {request.additional_context or 'None'}
    
    Return only the drafted message content, without any extra introductory text.
    """
    
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional school communication assistant. Write natively in Arabic."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        return MessageDraftResponse(draft=response.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
