from services.calculator import calculate_loan

TERM_LOAN = {
    "id": "term_loan", "interest_rate": 8.0, "loan_cap": 4500000,
    "loan_percentage": 90, "tenure_months": 60, "moratorium_months": 6,
}


def test_rajkot_dairy_example():
    result = calculate_loan(TERM_LOAN, 380000)
    assert result["possible_loan"] == 342000
    assert result["own_contribution"] == 38000
    assert result["total_repayable"] == result["monthly_estimate"] * 60


def test_loan_cap_applies_when_90pct_exceeds_cap():
    result = calculate_loan(TERM_LOAN, 6000000)
    assert result["possible_loan"] == 4500000
    assert result["own_contribution"] == 6000000 - 4500000


def test_boundary_at_140k_project_cost():
    micro = {**TERM_LOAN, "id": "micro_finance", "interest_rate": 6.5,
             "loan_cap": 125000, "tenure_months": 36, "moratorium_months": 0}
    result = calculate_loan(micro, 140000)
    assert result["possible_loan"] == 125000  # capped, not a raw 126000