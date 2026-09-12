from fastapi import APIRouter, HTTPException

from routes.partners import SCHEME_ID_TO_SEARCH_TERM
from schemas.result_models import ResultRequest, ResultResponse
from services.calculator import calculate_loan
from services.partner_locator import find_partners
from utils.loaders import get_scheme

router = APIRouter()


def _stub_pick_scheme(project_cost: int, purpose: str) -> str:
    """
    TEMPORARY placeholder ONLY - not the real recommendation engine.

    Ruchit's /api/recommend (per docs/api-contract.md) is the actual
    eligibility + reasoning logic and should replace this the moment
    it's ready. This exists only so the calculate + partners pipeline
    can be tested end-to-end while that work is in progress.
    """
    if purpose == "education":
        return "educational_loan"
    if project_cost <= 140000:
        return "micro_finance"
    return "term_loan"


@router.post("/api/result", response_model=ResultResponse)
def get_result(payload: ResultRequest):
    scheme_id = _stub_pick_scheme(payload.project_cost, payload.purpose)
    scheme = get_scheme(scheme_id)
    if scheme is None:
        raise HTTPException(
            status_code=500,
            detail=f"Stub picker returned an unknown scheme '{scheme_id}'",
        )

    calculation = calculate_loan(scheme, payload.project_cost)

    search_term = SCHEME_ID_TO_SEARCH_TERM.get(scheme_id, scheme["name"])
    partners = find_partners(
        state=payload.state,
        district=payload.district,
        scheme=search_term,
        latitude=payload.lat,
        longitude=payload.lon,
    )

    return ResultResponse(
        scheme_id=scheme_id,
        scheme_name=scheme["name"],
        calculation=calculation,
        partners=partners,
        note=(
            "scheme_id was chosen by a TEMPORARY placeholder rule, "
            "not the real /api/recommend logic. Replace once that's ready."
        ),
    )