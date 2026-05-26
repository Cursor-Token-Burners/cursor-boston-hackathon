## 1. Naming Conventions

**snake_case is used everywhere** — variable names, function names, field names, file names (except for Python-mandated names like `__init__.py`), URL path segments, and JSON keys in API requests/responses. This applies to all layers: data classes, service functions, router handlers, query helpers, utility functions, and serialization.


| Element                            | Convention                         | Examples                                                           |
| ---------------------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| Variables & function parameters    | snake_case                         | `phone_number`, `is_admin`, `shift_id`                             |
| Functions & methods                | snake_case                         | `create_user()`, `get_schedule_by_date()`, `validate_time_order()` |
| Classes (data classes, exceptions) | PascalCase                         | `UserResponse`, `ShiftCreateRequest`, `AppError`                   |
| File names                         | snake_case (except `__init__.py`)  | `user_queries.py`, `time_utils.py`, `app_errors.py`                |
| Module directories                 | lowercase                          | `users/`, `shifts/`, `db/`                                         |
| Constants                          | UPPER_SNAKE_CASE                   | `MAX_SHIFT_ASSIGNEES`, `ROOT_PHONE_NUMBER`                         |
| JSON / API field names             | snake_case                         | `phone_number`, `start_time`, `is_private`, `location_id`          |
| Database column names              | snake_case (match existing schema) | `phone_number`, `start_time`, `is_private`                         |


Database column names and API field names both use snake_case, so Pydantic models can align directly with the schema without renaming between layers (see Section 3).

## 2. Data Classes

Use **Pydantic `BaseModel`** for all data classes. Every request body, response body, and internal domain object must be a Pydantic model. Never pass raw dicts between layers.

## 3. Code Quality & Readability

### 3.1 Self-Documenting Code

Write code that communicates its intent through structure and naming alone. The goal is that a reader should be able to understand *what* and *why* without relying on comments.

**Use descriptive names.** Names should fully convey the purpose of the thing being named — avoid abbreviations, single-letter names, and vague terms like `data`, `info`, `result`, or `temp`.

```python
# Bad
def proc(u, s):
    r = db.get(s)
    if not r:
        raise NotFoundError()
    return r

# Good
def get_shift_or_raise(shift_id: int, current_user: UserRow) -> ShiftRow:
    shift = await shift_queries.get_shift_by_id(shift_id)
    if shift is None:
        raise NotFoundError(f"Shift {shift_id} not found.")
    return shift
```

**Extract complex or repeated logic into named functions.** If a block of code requires mental effort to parse, or appears more than once, it belongs in its own function with a name that makes its purpose obvious at the call site.

```python
# Bad — reader must trace through the logic to understand the condition
if not schedule.is_private and (
    schedule.visible_time is None or
    schedule.visible_time <= current_time_eastern()
):
    ...

# Good — intent is immediately clear
if is_schedule_visible_to_user(schedule):
    ...
```

### 3.2 Comments

Comments should be used **sparingly** and only when the code itself cannot communicate the intent. A comment is a last resort, not a substitute for clear code.

**Write comments for:**

- Non-obvious business rules or constraints (referencing the spec FR number is encouraged)
- Subtle edge cases that are easy to miss
- Math, bit manipulation, or other inherently dense expressions
- "Magic numbers" that have no self-evident meaning

**Do not write comments for:**

- Anything the code already says clearly
- Narrating what a line or block does step-by-step
- Section headers that just restate the function name

```python
# Bad — comment restates the code
# Check if the user is an admin
if current_user.is_admin:
    ...

# Bad — narrating obvious steps
# Get the shift from the database
shift = await shift_queries.get_shift_by_id(shift_id)
# If it doesn't exist, raise an error
if shift is None:
    raise NotFoundError()

# Good — explains a non-obvious rule from the spec
# FR-AUTH-03: return the same error whether the number is unknown or inactive,
# to avoid leaking whether a phone number exists in the system.
raise AuthenticationError("Invalid phone number or account inactive.")

# Good — explains a magic number
MAX_OTP_ATTEMPTS = 5  # Twilio Verify enforces a hard cap of 5 checks per lifecycle
```

### 3.3 Docstrings

Important classes, functions, and data fields should have docstrings. Use them consistently and keep them concise — one or two sentences is almost always enough. Docstrings describe *what* something does and *why* it exists, not *how* it does it.

**Docstring rules:**

- All public service functions must have a docstring.
- All Pydantic model classes must have a one-line docstring.
- Router handler functions do not need docstrings (the path, method, and return type are sufficient).
- Private/internal helpers (`_prefixed`) may omit docstrings if the name is clear enough.
- Use standard triple-quoted strings. Do not use `#` comments as a substitute.
- Do not repeat the function signature in the docstring.

```python
class UserBrief(BaseModel):
    """Minimal user representation used within schedule and shift responses."""
    phone_number: str
    name: str


class DailyScheduleResponse(BaseModel):
    """Full schedule payload returned to clients, with visibility already resolved."""
    date: str
    is_private: bool
    visible_time: str | None
    shifts: list[ShiftResponse]


async def create_shift(date: str, request: ShiftCreateRequest, current_user: UserRow) -> ShiftResponse:
    """Create a new shift within the daily schedule for the given date."""
    ...


async def is_schedule_visible_to_user(schedule: DailyScheduleRow, user: UserRow) -> bool:
    """Return True if the schedule is currently accessible to the given user.

    Admins always have access. Non-admins are blocked if the schedule is private
    or its visible_time has not yet passed in Eastern Time (FR-SCHEDULE-VISIBILITY-01).
    """
    ...
```

