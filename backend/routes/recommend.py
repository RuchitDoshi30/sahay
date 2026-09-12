from fastapi import APIRouter

from schemas.recommendation_models import RecommendationResponse, SchemeInfo, RejectedScheme
from schemas.request_models import ProfileRequest
from services.recommender import recommend

router = APIRouter()


@router.post("/api/recommend", response_model=RecommendationResponse)
def get_recommendation(payload: ProfileRequest):
    """
    POST /api/recommend

    Accepts a frozen user profile (9 fields) and returns a deterministic
    scheme recommendation — which scheme fits, why, and what was rejected.

    Validation is handled by Pydantic (ProfileRequest).
    Business logic lives entirely in services/recommender.py.
    This route does not contain any eligibility or scheme-selection rules.
    """

    profile = payload.model_dump()
    result = recommend(profile)

    # Convert nested dicts to typed Pydantic models for response_model validation
    recommended = (
        SchemeInfo(**result["recommended_scheme"])
        if result["recommended_scheme"]
        else None
    )

    alternative = (
        SchemeInfo(**result["alternative_scheme"])
        if result["alternative_scheme"]
        else None
    )

    rejected = [
        RejectedScheme(**r) for r in result["rejected_schemes"]
    ]

    return RecommendationResponse(
        eligible=result["eligible"],
        recommended_scheme=recommended,
        alternative_scheme=alternative,
        reasons=result["reasons"],
        rejected_schemes=rejected,
        ineligibility_reason=result["ineligibility_reason"],
    )
