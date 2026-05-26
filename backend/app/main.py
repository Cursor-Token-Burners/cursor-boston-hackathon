from __future__ import annotations

import os
import tempfile
from typing import Optional

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from .schemas import ACLAnalysisResponse, ACLTextIntake, VideoInput
from .triage import triage_from_text
from .video import analyze_video

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
    return {"ok": True}


@app.post("/analyze/acl", response_model=ACLAnalysisResponse)
async def analyze_acl(
    video: UploadFile = File(...),
    text_intake_json: str = Form(...),
    video_input_json: Optional[str] = Form(None),
) -> ACLAnalysisResponse:
    """
    Analyze ACL concern from:
    - structured text intake JSON
    - a short user-selected clip (video)
    """
    try:
        intake = ACLTextIntake.model_validate_json(text_intake_json)
    except ValidationError as e:
        return ACLAnalysisResponse(
            severity_band="insufficient_evidence",
            urgency="see_clinician_soon",
            confidence_0_1=0.2,
            red_flags=["invalid_text_intake_json"],
            rationale_bullets=[str(e)],
            next_steps=["Fix the intake JSON and retry."],
            extracted_video_signals={},
        )

    if video_input_json:
        try:
            vi = VideoInput.model_validate_json(video_input_json)
        except ValidationError:
            vi = VideoInput()
    else:
        vi = VideoInput()

    # Save upload to a temporary file for OpenCV/MediaPipe.
    suffix = os.path.splitext(video.filename or "")[1] or ".mp4"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name
        content = await video.read()
        tmp.write(content)

    try:
        text_triage = triage_from_text(intake)
        vid = analyze_video(tmp_path, vi)

        rationale = list(text_triage.rationale)
        next_steps = list(text_triage.next_steps)
        red_flags = list(text_triage.red_flags)

        # If video quality is too low, reduce confidence and avoid overclaiming.
        confidence = text_triage.confidence
        if vid.pose_coverage < 0.35:
            confidence = max(0.35, confidence - 0.2)
            rationale.append("Video pose tracking was low-confidence; recommendations rely mostly on the text intake.")

        # Heuristic: high variability in knee angle can reflect instability/limping/movement inconsistency
        # (camera-dependent, not diagnostic).
        if vid.knee_angle_std_deg is not None and vid.knee_angle_std_deg > 18:
            rationale.append("Video shows inconsistent knee motion (high variability), which can happen with guarding or instability.")
            if text_triage.severity_band in ("low_acl_concern", "insufficient_evidence"):
                # Only mild escalation; keep conservative.
                severity_band = "moderate_acl_concern"
            else:
                severity_band = text_triage.severity_band
            urgency = text_triage.urgency
            confidence = min(0.85, confidence + 0.05)
        else:
            severity_band = text_triage.severity_band
            urgency = text_triage.urgency

        # If the user reports buckling + classic pattern, push urgency higher.
        if intake.instability_giving_way is True and severity_band == "high_acl_concern":
            urgency = "ortho_or_sports_med_soon"

        # Emergency escalation only on very strong red flags in this simplified MVP.
        if intake.weight_bearing == "unable" and intake.pain_0_10 is not None and intake.pain_0_10 >= 8:
            urgency = "emergency_now"
            rationale.append("Severe pain with inability to bear weight warrants urgent evaluation.")

        return ACLAnalysisResponse(
            severity_band=severity_band,
            urgency=urgency,
            confidence_0_1=float(max(0.0, min(1.0, confidence))),
            red_flags=red_flags,
            rationale_bullets=rationale[:10],
            next_steps=next_steps[:10],
            extracted_video_signals=vid.as_dict(),
        )
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

