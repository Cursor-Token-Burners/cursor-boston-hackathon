from __future__ import annotations

import os
import tempfile
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from .acl_service import ACLServiceError, combine_text_video_acl
from .schemas import ACLAnalysisResponse, ACLTextIntake, VideoInput

app = FastAPI(title="ACL Video+Text Triage API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    """Simple process health probe used by frontend and deployment checks."""
    return {"ok": True}


@app.post("/analyze/acl", response_model=ACLAnalysisResponse)
async def analyze_acl(
    video: UploadFile = File(...),
    text_intake_json: str = Form(...),
    video_input_json: Optional[str] = Form(None),
) -> ACLAnalysisResponse:
    """
    Analyze ACL concern from structured text + user-selected video clip.

    Request form fields:
    - `video`: binary upload for movement analysis.
    - `text_intake_json`: serialized `ACLTextIntake` JSON payload.
    - `video_input_json`: optional serialized `VideoInput` JSON payload.

    Response:
    A structured severity/urgency decision with confidence, rationale, and
    extracted pose-derived movement signals.
    """
    try:
        intake = ACLTextIntake.model_validate_json(text_intake_json)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=f"Invalid text_intake_json: {e}") from e

    if video_input_json:
        try:
            vi = VideoInput.model_validate_json(video_input_json)
        except ValidationError as e:
            raise HTTPException(status_code=422, detail=f"Invalid video_input_json: {e}") from e
    else:
        vi = VideoInput()

    filename = video.filename or "upload.mp4"
    if not filename.lower().endswith((".mp4", ".mov", ".avi", ".mkv", ".webm")):
        raise HTTPException(status_code=415, detail="Unsupported video format. Use mp4/mov/avi/mkv/webm.")

    try:
        content = await video.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {e}") from e

    if not content:
        raise HTTPException(status_code=400, detail="Uploaded video file is empty.")

    # 200 MB guardrail for local hackathon runtime.
    if len(content) > 200 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Uploaded video too large; please keep under 200MB.")

    suffix = os.path.splitext(filename)[1] or ".mp4"
    tmp_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp_path = tmp.name
            tmp.write(content)

        result = combine_text_video_acl(intake=intake, video_path=tmp_path, video_input=vi)
        return ACLAnalysisResponse(
            severity_band=result.severity_band,
            urgency=result.urgency,
            confidence_0_1=result.confidence_0_1,
            red_flags=result.red_flags,
            rationale_bullets=result.rationale_bullets,
            next_steps=result.next_steps,
            extracted_video_signals={
                **result.extracted_video_signals,
                "rag_context": result.rag_context,
            },
        )
    except ACLServiceError as e:
        # Corrupt videos, no detectable person, and retrieval misses are surfaced clearly.
        raise HTTPException(status_code=422, detail=str(e)) from e
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected ACL analysis failure: {e}") from e
    finally:
        if tmp_path:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

