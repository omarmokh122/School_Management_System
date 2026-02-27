from fastapi import APIRouter, Depends, Query, BackgroundTasks
from pydantic import BaseModel
from typing import Any, Dict
from app.api import dependencies

router = APIRouter()

class WebhookPayload(BaseModel):
    event_type: str
    data: Dict[str, Any]

def mock_process_webhook(payload: WebhookPayload, school_id: str):
    """
    Mock background task that would forward this event to an external n8n workflow.
    """
    print(f"Triggering n8n workflow for school {school_id} - Event {payload.event_type}")
    pass

@router.post("/trigger")
async def trigger_n8n_automation(
    payload: WebhookPayload,
    background_tasks: BackgroundTasks,
    school_id: str = Depends(dependencies.get_current_tenant),
    _ = Depends(dependencies.require_role(["Admin"]))
):
    """
    Standardized webhook endpoint for n8n automations.
    Admins can trigger workflows (e.g., generate PDF report, send parent emails).
    The actual forwarding happens in the background to keep the API fast.
    """
    # In a real scenario, this would post to the n8n webhook URL configured for this school_id
    background_tasks.add_task(mock_process_webhook, payload, school_id)
    return {"status": "Automation triggered successfully", "event": payload.event_type}
