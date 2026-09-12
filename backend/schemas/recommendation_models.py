from typing import List, Optional

from pydantic import BaseModel


class SchemeInfo(BaseModel):
    """
    One scheme entry from schemes.json.
    Returned inside recommended_scheme and alternative_scheme.
    Field names mirror schemes.json exactly — do not rename.
    """

    id: str
    name: str
    interest_rate: float
    max_project_cost: int
    loan_cap: int
    loan_percentage: int
    tenure_months: int
    moratorium_months: int


class RejectedScheme(BaseModel):
    """
    A scheme that was considered but ruled out, with the specific reason why.
    Returned in the rejected_schemes list so the frontend can explain the logic.
    """

    scheme_id: str
    scheme_name: str
    rejection_reason: str


class RecommendationResponse(BaseModel):
    """
    Full response from POST /api/recommend.
    Shape matches docs/api-contract.md — do not change field names without
    updating the contract and decision-log.md.
    """

    # Whether the user passes the baseline eligibility checks
    eligible: bool

    # The best-fit scheme for this profile (None when ineligible)
    recommended_scheme: Optional[SchemeInfo] = None

    # The next-best scheme where one exists (None when not applicable)
    alternative_scheme: Optional[SchemeInfo] = None

    # Plain-language reasons that explain WHY the scheme was recommended
    reasons: List[str] = []

    # Schemes that were considered and rejected, with specific per-scheme reasons
    rejected_schemes: List[RejectedScheme] = []

    # Set only when the user fails baseline eligibility (SC cert or income)
    ineligibility_reason: Optional[str] = None
