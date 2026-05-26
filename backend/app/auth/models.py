from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Credentials for email/password login."""

    email: EmailStr
    password: str


class AcceptInvitationRequest(BaseModel):
    """Payload for accepting an organization invitation and creating an account."""

    token: str
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1)


class UserBrief(BaseModel):
    """Minimal user representation returned after authentication."""

    id: int
    email: str
    full_name: str
    role: str
    organization_id: int


class AuthResponse(BaseModel):
    """Authentication response containing a JWT and user details."""

    access_token: str
    token_type: str = "bearer"
    user: UserBrief
