from pydantic import BaseModel, EmailStr, Field

from app.auth.models import AuthResponse


class CreateOrganizationRequest(BaseModel):
    """Bootstrap payload to create an organization and its first coach."""

    organization_name: str = Field(min_length=1)
    coach_email: EmailStr
    coach_password: str = Field(min_length=8)
    coach_full_name: str = Field(min_length=1)


class CreateInvitationRequest(BaseModel):
    """Request to invite a coach, doctor, or player to an organization."""

    email: EmailStr
    role: str = Field(pattern="^(coach|player|doctor)$")


class OrganizationResponse(BaseModel):
    """Organization details returned to clients."""

    id: int
    name: str


class CreateOrganizationResponse(BaseModel):
    """Response after bootstrapping an organization and coach account."""

    organization: OrganizationResponse
    auth: AuthResponse


class InvitationResponse(BaseModel):
    """Invitation details including the token for prototype acceptance."""

    id: int
    email: str
    role: str
    status: str
    invitation_token: str
    accept_path: str = "/auth/accept-invitation"


class OrganizationMemberResponse(BaseModel):
    """Organization member summary."""

    id: int
    email: str
    full_name: str
    role: str
