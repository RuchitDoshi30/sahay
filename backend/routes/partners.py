from typing import Optional

from fastapi import APIRouter, HTTPException

from schemas.partner_models import PartnersResponse
from services.partner_locator import find_partners
from utils.loaders import get_scheme

router = APIRouter()

# Our schemes.json uses IDs like "term_loan", but the partner data
# (owned by Pair 3) stores the scheme as a free-text description like
# "MSME Enterprise Credit" or "Cooperative & Dairy Loans" - there is no
# scheme_id field on partner records.
#
# So we translate scheme_id -> a plain search word that partner_locator's
# keyword matching already understands. This is a rough bridge, not a
# precise mapping - flagged for review with Jaymin/Ruchit.
SCHEME_ID_TO_SEARCH_TERM = {
    "term_loan": "term loan",
    "micro_finance": "microfinance",
    "mahila_samridhi": "microfinance",
    "aajeevika_microfinance": "microfinance",
    "green_business": "green",
    "udyam_nidhi": "msme",
    "educational_loan": "education",
    "vocational_education": "education",
}


@router.get("/api/partners", response_model=PartnersResponse)
def get_partners(
    state: str,
    district: str,
    scheme_id: str,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    require_eligible_funds: bool = True,
):
    scheme = get_scheme(scheme_id)
    if scheme is None:
        raise HTTPException(status_code=404, detail=f"Scheme '{scheme_id}' not found")

    search_term = SCHEME_ID_TO_SEARCH_TERM.get(scheme_id, scheme["name"])

    results = find_partners(
        state=state,
        district=district,
        scheme=search_term,
        latitude=lat,
        longitude=lon,
        require_eligible_funds=require_eligible_funds,
    )

    return PartnersResponse(
        partners=results,
        total=len(results),
        filter_applied={
            "state": state,
            "district": district,
            "scheme_id": scheme_id,
        },
    )