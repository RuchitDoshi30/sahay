from typing import List, Optional

from pydantic import BaseModel

from schemas.calculation_models import CalculateResponse
from schemas.partner_models import PartnerResult


class ResultRequest(BaseModel):
    has_sc_certificate: bool
    annual_income: int
    purpose: str
    project_cost: int
    activity_type: str
    state: str
    district: str
    lat: Optional[float] = None
    lon: Optional[float] = None


class ResultResponse(BaseModel):
    scheme_id: str
    scheme_name: str
    calculation: CalculateResponse
    partners: List[PartnerResult]
    note: str