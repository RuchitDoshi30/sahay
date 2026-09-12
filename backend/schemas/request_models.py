from typing import Optional

from pydantic import BaseModel, Field


class ProfileRequest(BaseModel):
    """
    Frozen user profile — field names match docs/api-contract.md exactly.
    DO NOT rename fields without updating api-contract.md and decision-log.md.
    """

    has_sc_certificate: bool = Field(
        ...,
        description="Whether the applicant holds a valid SC/ST certificate.",
    )

    annual_income: int = Field(
        ...,
        gt=0,
        description="Annual family income in INR. Eligibility ceiling: ₹5,00,000.",
    )

    purpose: str = Field(
        ...,
        description="Loan purpose. Accepted values: 'business' or 'education'.",
    )

    project_cost: int = Field(
        ...,
        gt=0,
        description="Estimated total project / course cost in INR.",
    )

    activity_type: str = Field(
        ...,
        description="Nature of the business or education activity. e.g. 'dairy', 'kirana', 'btech'.",
    )

    state: str = Field(
        ...,
        description="Full state name. e.g. 'Gujarat'.",
    )

    district: str = Field(
        ...,
        description="Full district name. e.g. 'Rajkot'.",
    )

    latitude: Optional[float] = Field(
        default=None,
        description="User's GPS latitude (optional). Used for distance-sorted partner results.",
    )

    longitude: Optional[float] = Field(
        default=None,
        description="User's GPS longitude (optional). Used for distance-sorted partner results.",
    )

    gender: Optional[str] = Field(
        default=None,
        description="Applicant gender ('female', 'male', 'other'). Used to target women-specific schemes like Mahila Samridhi Yojana.",
    )
