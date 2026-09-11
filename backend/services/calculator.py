def calculate_loan(scheme: dict, project_cost: int) -> dict:
    """
    scheme = one entry from schemes.json, e.g.
    {
      "id": "term_loan", "interest_rate": 8.0, "loan_cap": 4500000,
      "loan_percentage": 90, "tenure_months": 60, "moratorium_months": 6
    }
    """
    loan_pct = scheme["loan_percentage"] / 100
    possible_loan = min(round(project_cost * loan_pct), scheme["loan_cap"])
    own_contribution = project_cost - possible_loan

    annual_rate = scheme["interest_rate"]
    tenure_months = scheme["tenure_months"]
    monthly_rate = annual_rate / 12 / 100

    if monthly_rate == 0:
        monthly_estimate = round(possible_loan / tenure_months)
    else:
        factor = (1 + monthly_rate) ** tenure_months
        monthly_estimate = int(possible_loan * monthly_rate * factor / (factor - 1))

    total_repayable = monthly_estimate * tenure_months

    return {
        "scheme_id": scheme["id"],
        "project_cost": project_cost,
        "possible_loan": possible_loan,
        "own_contribution": own_contribution,
        "loan_percentage": scheme["loan_percentage"],
        "interest_rate": annual_rate,
        "tenure_months": tenure_months,
        "moratorium_months": scheme["moratorium_months"],
        "monthly_estimate": monthly_estimate,
        "total_repayable": total_repayable,
        "note": "EMI calculated after moratorium period. Monthly estimate is indicative only.",
    }