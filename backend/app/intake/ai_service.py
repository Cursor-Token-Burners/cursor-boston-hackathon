from openai import AsyncOpenAI
from pydantic import BaseModel

from app.config import settings
from app.intake.models import AclAssessmentResult, IntakeTurnResult, SymptomSnapshot

INTAKE_SYSTEM_PROMPT = """You are a sports medicine intake assistant helping an athlete describe a possible ACL knee injury.

Your goals:
1. Extract structured symptom information from the conversation.
2. Ask ONE focused follow-up question at a time for missing critical details.
3. Be empathetic, concise, and plain-spoken.
4. Do not diagnose definitively — gather information for a later assessment step.
5. Mark is_ready_for_assessment true only when you have enough information about:
   - injury mechanism (how it happened)
   - heard_pop (yes/no/unknown)
   - swelling_level (none/mild/moderate/severe)
   - pain_level (0-10)
   - instability (knee giving way: yes/no/unknown)
   - weight_bearing (full/partial/unable)
   - prior_acl_history (yes/no)
   - surgery_status (none/planned/post_op/unknown)

If the athlete has not yet described what happened, ask them to describe the injury first.
"""

ASSESSMENT_SYSTEM_PROMPT = """You are a sports medicine assistant producing a preliminary ACL injury assessment based on intake data.

Use the symptom information and conversation to estimate:
- likely_grade: 1 (mild stretch), 2 (partial tear), 3 (complete tear), or uncertain
- confidence: 0.0 to 1.0
- reasoning: brief explanation of your assessment
- urgency: immediate (needs urgent evaluation), soon (within days), or routine

This is not a definitive medical diagnosis. Be conservative when symptoms suggest instability, complete tear, or inability to bear weight.
"""


class ConversationMessage(BaseModel):
    role: str
    content: str


def _openai_client() -> AsyncOpenAI:
    return AsyncOpenAI(api_key=settings.openai_api_key)


def _format_conversation(messages: list[ConversationMessage]) -> str:
    return "\n".join(f"{message.role}: {message.content}" for message in messages)


async def process_intake_message(
    conversation_messages: list[ConversationMessage],
    current_symptoms: SymptomSnapshot,
) -> IntakeTurnResult:
    """Process one intake turn and return the assistant reply plus updated symptoms."""
    client = _openai_client()
    user_prompt = (
        f"Current symptoms JSON:\n{current_symptoms.model_dump_json()}\n\n"
        f"Conversation so far:\n{_format_conversation(conversation_messages)}"
    )
    completion = await client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": INTAKE_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format=IntakeTurnResult,
    )
    parsed = completion.choices[0].message.parsed
    if parsed is None:
        raise RuntimeError("OpenAI returned an empty intake turn result.")
    return parsed


async def generate_acl_assessment(
    conversation_messages: list[ConversationMessage],
    symptoms: SymptomSnapshot,
) -> AclAssessmentResult:
    """Generate a structured ACL assessment from the full intake conversation."""
    client = _openai_client()
    user_prompt = (
        f"Symptoms JSON:\n{symptoms.model_dump_json()}\n\n"
        f"Conversation:\n{_format_conversation(conversation_messages)}"
    )
    completion = await client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": ASSESSMENT_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format=AclAssessmentResult,
    )
    parsed = completion.choices[0].message.parsed
    if parsed is None:
        raise RuntimeError("OpenAI returned an empty ACL assessment.")
    return parsed


def should_recommend_doctor(assessment: AclAssessmentResult, symptoms: SymptomSnapshot) -> bool:
    """Apply business rules for when a doctor visit should be recommended."""
    if assessment.likely_grade == "3":
        return True
    if assessment.urgency == "immediate":
        return True
    if symptoms.instability is True:
        return True
    return False
