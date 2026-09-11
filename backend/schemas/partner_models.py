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


class PartnersResponse(BaseModel):
    partners: List[PartnerResult]
    total: int
    filter_applied: dict