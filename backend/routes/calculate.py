from fastapi import APIRouter, HTTPException

from schemas.calculation_models import CalculateRequest, CalculateResponse
from services.calculator import calculate_loan
from utils.loaders import get_scheme

router = APIRouter()


@router.post("/api/calculate", response_model=CalculateResponse)
def calculate(payload: CalculateRequest):
    scheme = get_scheme(payload.scheme_id)
    if scheme is None:
        raise HTTPException(status_code=404, detail=f"Scheme '{payload.scheme_id}' not found")
    return calculate_loan(scheme, payload.project_cost)