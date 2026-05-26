from pydantic import BaseModel, Field


class ExerciseItem(BaseModel):
    """Single rehab exercise with instructions."""

    name: str
    description: str
    reps: str
    sets: str | None = None


class CarePlanContent(BaseModel):
    """Structured interim care plan for a given ACL grade."""

    summary: str
    exercises: list[ExerciseItem]
    avoid_activities: list[str]
    warning_signs: list[str]
    recovery_timeline_weeks: str


GRADE_1_CARE_PLAN = CarePlanContent(
    summary=(
        "Likely mild ACL strain (Grade 1). Focus on reducing swelling, restoring range of motion, "
        "and maintaining strength while returning to activity gradually."
    ),
    exercises=[
        ExerciseItem(
            name="Heel Slides",
            description="Lie on your back. Slide heel toward buttocks, then slowly straighten.",
            reps="10-15",
            sets="2-3",
        ),
        ExerciseItem(
            name="Quad Sets",
            description="Straighten leg, tighten thigh muscle, push knee downward into towel/floor. Hold 5-10 seconds.",
            reps="10-15",
        ),
        ExerciseItem(
            name="Straight Leg Raises",
            description="Keep knee straight, lift leg about 12 inches, lower slowly.",
            reps="10-15",
            sets="2-3",
        ),
        ExerciseItem(
            name="Standing Hamstring Curls",
            description="Bend knee slowly and bring heel toward buttocks.",
            reps="10-15",
        ),
        ExerciseItem(
            name="Calf Raises",
            description="Rise onto toes and lower slowly.",
            reps="15-20",
        ),
        ExerciseItem(
            name="Single-Leg Balance",
            description="Stand on injured leg for 20-30 seconds. Progress to unstable surfaces later.",
            reps="1",
            sets="2-3",
        ),
    ],
    avoid_activities=[
        "Pivoting or twisting on the injured knee",
        "High-impact activities until pain and swelling are controlled",
    ],
    warning_signs=[
        "Knee buckling or giving out",
        "Sharp pain during exercise",
        "Major increase in swelling",
        "Locking or catching in the knee",
        "Loss of motion",
        "Instability",
    ],
    recovery_timeline_weeks="2-6 weeks",
)

GRADE_2_CARE_PLAN = CarePlanContent(
    summary=(
        "Likely partial ACL tear (Grade 2). Continue early mobility work and add stability-focused "
        "strengthening while avoiding pivoting and twisting."
    ),
    exercises=[
        *GRADE_1_CARE_PLAN.exercises,
        ExerciseItem(
            name="Mini Squats",
            description="Feet shoulder-width apart. Squat to about 45 degrees, keeping knees aligned.",
            reps="10-15",
        ),
        ExerciseItem(
            name="Step-Ups",
            description="Use a low step. Step up slowly and control the descent.",
            reps="10 each leg",
        ),
        ExerciseItem(
            name="Bridges",
            description="Lie on back with knees bent. Lift hips upward and hold 2-3 seconds.",
            reps="10-15",
        ),
        ExerciseItem(
            name="Resistance Band Terminal Knee Extensions",
            description="Band behind knee. Move from slight bend to straighten knee.",
            reps="15",
        ),
        ExerciseItem(
            name="Side-Lying Leg Raises",
            description="Hip stability work while lying on your side.",
            reps="10-15",
        ),
        ExerciseItem(
            name="Stationary Bike",
            description="Low resistance cycling to maintain fitness.",
            reps="5-10 minutes",
        ),
    ],
    avoid_activities=[
        "Pivoting and twisting movements",
        "Cutting or sudden direction changes",
        "Jumping until stability improves",
    ],
    warning_signs=GRADE_1_CARE_PLAN.warning_signs,
    recovery_timeline_weeks="6-12 weeks",
)

GRADE_3_CARE_PLAN = CarePlanContent(
    summary=(
        "Likely complete ACL tear (Grade 3). Prioritize swelling control, restoring motion, and "
        "protecting the knee from instability until evaluated by an orthopedic specialist."
    ),
    exercises=[
        ExerciseItem(
            name="Quad Sets",
            description="Critical after complete tear. Straighten leg and tighten thigh muscle.",
            reps="10-15",
            sets="2-3",
        ),
        ExerciseItem(
            name="Heel Slides",
            description="Lie on back and slide heel toward buttocks to improve flexion.",
            reps="10-15",
            sets="2-3",
        ),
        ExerciseItem(
            name="Straight Leg Raises",
            description="Keep knee straight, lift leg about 12 inches, lower slowly.",
            reps="10-15",
            sets="2-3",
        ),
        ExerciseItem(
            name="Ankle Pumps",
            description="Pump ankle up and down to reduce swelling and improve circulation.",
            reps="10-15",
            sets="2-3",
        ),
        ExerciseItem(
            name="Wall Sits",
            description="Partial range initially. Hold 15-30 seconds.",
            reps="1",
            sets="2-3",
        ),
        ExerciseItem(
            name="Hamstring Curls",
            description="Important for dynamic knee support once pain allows.",
            reps="10-15",
        ),
        ExerciseItem(
            name="Clamshells",
            description="Hip and glute stabilization exercise.",
            reps="10-15",
        ),
    ],
    avoid_activities=[
        "Pivoting",
        "Cutting movements",
        "Jumping early in recovery",
        "Deep twisting",
        "Aggressive open-chain knee extensions",
    ],
    warning_signs=GRADE_1_CARE_PLAN.warning_signs,
    recovery_timeline_weeks="3-6+ months (non-operative) or 6-12 months (post-operative)",
)

UNCERTAIN_CARE_PLAN = CarePlanContent(
    summary=(
        "Injury severity is uncertain. Use relative rest, ice, compression, and elevation while "
        "avoiding activities that stress the knee until evaluated by a clinician."
    ),
    exercises=[
        ExerciseItem(
            name="Ankle Pumps",
            description="Pump ankle up and down to reduce swelling and improve circulation.",
            reps="10-15",
            sets="2-3",
        ),
        ExerciseItem(
            name="Quad Sets",
            description="Gently activate quadriceps without aggravating pain.",
            reps="10-15",
        ),
        ExerciseItem(
            name="Heel Slides",
            description="Gentle range-of-motion work if pain allows.",
            reps="10-15",
        ),
    ],
    avoid_activities=[
        "Pivoting, cutting, or jumping",
        "Activities that increase pain or swelling",
    ],
    warning_signs=GRADE_1_CARE_PLAN.warning_signs,
    recovery_timeline_weeks="Varies — follow up with a clinician for guidance",
)

GENERAL_REHAB_PRINCIPLES = [
    "Reduce swelling first with ice, compression, elevation, and relative rest.",
    "Restore full knee extension early.",
    "Focus on quadriceps, hamstrings, glutes, hip stability, and balance.",
    "Avoid aggressive open-chain knee extensions early in rehab.",
]


def build_care_plan_for_grade(likely_grade: str) -> CarePlanContent:
    """Return the interim care plan content for the given ACL grade."""
    care_plans_by_grade = {
        "1": GRADE_1_CARE_PLAN,
        "2": GRADE_2_CARE_PLAN,
        "3": GRADE_3_CARE_PLAN,
        "uncertain": UNCERTAIN_CARE_PLAN,
    }
    return care_plans_by_grade.get(likely_grade, UNCERTAIN_CARE_PLAN)
