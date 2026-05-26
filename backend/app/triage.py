from __future__ import annotations

from dataclasses import dataclass

from .schemas import ACLTextIntake, SeverityBand, Urgency


@dataclass(frozen=True)
class TriageResult:
    severity_band: SeverityBand
    urgency: Urgency
    confidence: float
    red_flags: list[str]
    rationale: list[str]
    next_steps: list[str]


def triage_from_text(intake: ACLTextIntake) -> TriageResult:
    """
    Safety-first ACL triage rubric.
    This is not diagnosis; it's a conservative urgency recommendation.
    """
    red_flags: list[str] = []
    rationale: list[str] = []

    # Red flags
    if intake.locking_catching is True:
        red_flags.append("knee_locking_or_catching")
        rationale.append("Locking/catching can suggest internal derangement (e.g., meniscus) and needs clinician evaluation.")

    if intake.weight_bearing == "unable":
        red_flags.append("unable_to_bear_weight")
        rationale.append("Unable to bear weight suggests a more serious injury and should be evaluated promptly.")

    if intake.instability_giving_way is True:
        rationale.append("Reports of knee giving-way increase concern for ligament injury including ACL.")

    # ACL pattern signals
    acl_pattern_score = 0
    if intake.mechanism in ("pivot_twist", "noncontact_jump"):
        acl_pattern_score += 2
        rationale.append("Mechanism (pivot/twist or landing) is consistent with common ACL injury patterns.")
    if intake.heard_pop is True:
        acl_pattern_score += 2
        rationale.append("A 'pop' at injury increases suspicion for ACL tear.")
    if intake.immediate_swelling_within_2h is True:
        acl_pattern_score += 2
        rationale.append("Rapid swelling can indicate hemarthrosis, seen in ACL tears.")
    if intake.instability_giving_way is True:
        acl_pattern_score += 2

    # Pain is supportive but not decisive.
    if intake.pain_0_10 is not None and intake.pain_0_10 >= 7:
        acl_pattern_score += 1

    # Determine baseline severity/urgency from text.
    if len(red_flags) > 0:
        # Not necessarily emergency unless extreme; keep conservative but not panic.
        severity_band: SeverityBand = "high_acl_concern"
        urgency: Urgency = "ortho_or_sports_med_soon"
        confidence = 0.75
    else:
        if acl_pattern_score >= 6:
            severity_band = "high_acl_concern"
            urgency = "ortho_or_sports_med_soon"
            confidence = 0.75
        elif acl_pattern_score >= 3:
            severity_band = "moderate_acl_concern"
            urgency = "see_clinician_soon"
            confidence = 0.65
        elif acl_pattern_score >= 1:
            severity_band = "low_acl_concern"
            urgency = "see_clinician_soon"
            confidence = 0.55
        else:
            severity_band = "insufficient_evidence"
            urgency = "see_clinician_soon"
            confidence = 0.45

    next_steps: list[str] = [
        "Avoid pivoting/cutting/jumping until evaluated or symptoms clearly improve.",
        "Use relative rest, compression, elevation, and ice for swelling/pain if tolerated.",
        "If the knee repeatedly buckles, locks, or swelling rapidly worsens, seek urgent evaluation.",
    ]

    return TriageResult(
        severity_band=severity_band,
        urgency=urgency,
        confidence=confidence,
        red_flags=red_flags,
        rationale=rationale,
        next_steps=next_steps,
    )

