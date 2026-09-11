from pydantic import BaseModel, Field


class CalculateRequest(BaseModel):
    scheme_id: str
    project_cost: int = Field(..., gt=0)


class CalculateResponse(BaseModel):
    scheme_id: str
    project_cost: int
    possible_loan: int
    own_contribution: int
    loan_percentage: int
    interest_rate: float
    tenure_months: int
    moratorium_months: int
    monthly_estimate: int
    total_repayable: int
    note: str