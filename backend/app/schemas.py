from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, Field


class ACLTextIntake(BaseModel):
    # Keep this small and structured; free-text can live in `notes`.
    mechanism: Optional[Literal["pivot_twist", "contact", "noncontact_jump", "unknown"]] = None
    heard_pop: Optional[bool] = None
    immediate_swelling_within_2h: Optional[bool] = None
    instability_giving_way: Optional[bool] = None
    locking_catching: Optional[bool] = None
    weight_bearing: Optional[Literal["normal", "painful", "unable"]] = None
    pain_0_10: Optional[int] = Field(default=None, ge=0, le=10)
    hours_since_injury: Optional[float] = Field(default=None, ge=0)
    notes: Optional[str] = None


class VideoInput(BaseModel):
    # Seconds into the video to start analyzing (user-selected).
    start_sec: float = Field(default=0, ge=0)
    # Duration analyzed in seconds.
    duration_sec: float = Field(default=8, ge=2, le=20)
    # Optional ROI as normalized coords in [0,1] to focus the person.
    # If omitted, we try best-effort pose on full frame (less reliable).
    roi_x: Optional[float] = Field(default=None, ge=0, le=1)
    roi_y: Optional[float] = Field(default=None, ge=0, le=1)
    roi_w: Optional[float] = Field(default=None, ge=0, le=1)
    roi_h: Optional[float] = Field(default=None, ge=0, le=1)


SeverityBand = Literal["low_acl_concern", "moderate_acl_concern", "high_acl_concern", "insufficient_evidence"]
Urgency = Literal["self_care", "see_clinician_soon", "ortho_or_sports_med_soon", "emergency_now"]


class ACLAnalysisResponse(BaseModel):
    severity_band: SeverityBand
    urgency: Urgency
    confidence_0_1: float = Field(ge=0, le=1)
    red_flags: list[str] = Field(default_factory=list)
    rationale_bullets: list[str] = Field(default_factory=list)
    next_steps: list[str] = Field(default_factory=list)
    extracted_video_signals: dict = Field(default_factory=dict)

