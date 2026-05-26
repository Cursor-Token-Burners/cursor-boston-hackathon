from __future__ import annotations

from dataclasses import dataclass

from .acl_knowledge import ACLKnowledgeError, retrieve_acl_snippets
from .schemas import ACLTextIntake, VideoInput
from .triage import TriageResult, triage_from_text
from .video import VideoAnalysisError, VideoSignals, analyze_video


class ACLServiceError(Exception):
    """Top-level service error for ACL analysis orchestration failures."""


@dataclass(frozen=True)
class ACLCompositeResult:
    """Merged output from text triage, video analysis, and knowledge retrieval."""

    severity_band: str
    urgency: str
    confidence_0_1: float
    red_flags: list[str]
    rationale_bullets: list[str]
    next_steps: list[str]
    extracted_video_signals: dict
    rag_context: list[str]


def _compose_query(intake: ACLTextIntake) -> str:
    """
    Build a retrieval query from structured intake.

    We intentionally include only concise, clinically relevant tokens so the
    retrieval stage can match specific ACL rehab guidance sections.
    """
    parts: list[str] = []
    if intake.mechanism:
        parts.append(intake.mechanism)
    if intake.heard_pop:
        parts.append("pop")
    if intake.immediate_swelling_within_2h:
        parts.append("swelling")
    if intake.instability_giving_way:
        parts.append("instability")
    if intake.locking_catching:
        parts.append("locking catching")
    if intake.notes:
        parts.append(intake.notes)
    return " ".join(parts).strip() or "acl rehab grade exercise stability swelling"


def combine_text_video_acl(
    intake: ACLTextIntake,
    video_path: str,
    video_input: VideoInput,
) -> ACLCompositeResult:
    """
    Merge text and video evidence into a single ACL triage output.

    Pipeline:
    1) Compute conservative text triage baseline.
    2) Extract movement signals from user-selected video clip.
    3) Retrieve ACL rehab snippets (RAG-lite) for grounded guidance context.
    4) Apply guarded heuristic fusion to avoid overconfident escalation.
    """
    try:
        text_triage: TriageResult = triage_from_text(intake)
    except Exception as exc:
        raise ACLServiceError(f"Text triage failed: {exc}") from exc

    try:
        vid: VideoSignals = analyze_video(video_path, video_input)
    except VideoAnalysisError as exc:
        raise ACLServiceError(str(exc)) from exc
    except Exception as exc:
        raise ACLServiceError(f"Unexpected video analysis error: {exc}") from exc

    try:
        snippets = retrieve_acl_snippets(_compose_query(intake))
        rag_context = [s.body for s in snippets]
    except ACLKnowledgeError:
        rag_context = ["No specific ACL rehab snippet matched; provide conservative follow-up advice."]

    rationale = list(text_triage.rationale)
    next_steps = list(text_triage.next_steps)
    red_flags = list(text_triage.red_flags)
    confidence = text_triage.confidence
    severity_band = text_triage.severity_band
    urgency = text_triage.urgency

    # Merge video quality as a reliability gate.
    if vid.pose_coverage < 0.35:
        confidence = max(0.35, confidence - 0.2)
        rationale.append("Video tracking quality was low; text signals were weighted more heavily.")

    # Merge movement consistency as a weak ACL concern signal (non-diagnostic).
    if vid.knee_angle_std_deg is not None and vid.knee_angle_std_deg > 18:
        rationale.append("Video shows high knee motion variability, which can reflect guarding or instability.")
        if severity_band in ("low_acl_concern", "insufficient_evidence"):
            severity_band = "moderate_acl_concern"
        confidence = min(0.85, confidence + 0.05)

    if intake.instability_giving_way is True and severity_band == "high_acl_concern":
        urgency = "ortho_or_sports_med_soon"

    if intake.weight_bearing == "unable" and intake.pain_0_10 is not None and intake.pain_0_10 >= 8:
        urgency = "emergency_now"
        rationale.append("Severe pain with inability to bear weight requires urgent evaluation.")

    if rag_context:
        next_steps.append("Grounded ACL rehab context was used to keep exercise guidance conservative and phase-appropriate.")

    return ACLCompositeResult(
        severity_band=severity_band,
        urgency=urgency,
        confidence_0_1=float(max(0.0, min(1.0, confidence))),
        red_flags=red_flags,
        rationale_bullets=rationale[:10],
        next_steps=next_steps[:10],
        extracted_video_signals=vid.as_dict(),
        rag_context=rag_context,
    )

