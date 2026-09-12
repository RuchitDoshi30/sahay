from typing import List, Optional
from pydantic import BaseModel


class PartnerResult(BaseModel):
    id: str
    name: str
    type: Optional[str] = None
    state: str
    district: str
    address: Optional[str] = None
    scheme: Optional[str] = None
    service_area: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distance_km: Optional[float] = None
    reason: str
    phone: Optional[str] = None
    email: Optional[str] = None
    hours: Optional[str] = None
    verified: Optional[bool] = None
    supported_schemes: Optional[List[str]] = None
    fund_available: Optional[bool] = None
    no_overdues: Optional[bool] = None
    npa_percentage: Optional[float] = None
    fund_utilization_pct: Optional[float] = None
    eligible_for_routing: Optional[bool] = None
    rank_score: Optional[int] = None
    data_source: Optional[str] = None
    prototype_status: Optional[str] = None


class PartnersResponse(BaseModel):
    partners: List[PartnerResult]
    total: int
    filter_applied: dict