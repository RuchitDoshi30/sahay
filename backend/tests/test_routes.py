"""
test_routes.py  —  Sahay SIH26092
HTTP-level route tests using FastAPI TestClient.

Tests all three API endpoints at the HTTP layer:
  POST /api/recommend
  POST /api/calculate
  GET  /api/partners
  GET  /api/health

These tests verify:
  - correct HTTP status codes
  - response JSON shapes match api-contract.md
  - validation errors return 422
  - unknown scheme IDs return 404
  - the full Rajkot integration journey (recommend → calculate → partners)
"""

import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

# ─── Canonical Rajkot request ──────────────────────────────────────────────────

RAJKOT = {
    "has_sc_certificate": True,
    "annual_income": 300000,
    "purpose": "business",
    "project_cost": 380000,
    "activity_type": "dairy",
    "state": "Gujarat",
    "district": "Rajkot",
}


# ══════════════════════════════════════════════════════════════════════════════
# /api/health
# ══════════════════════════════════════════════════════════════════════════════

def test_health_returns_200():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


# ══════════════════════════════════════════════════════════════════════════════
# POST /api/recommend
# ══════════════════════════════════════════════════════════════════════════════

def test_recommend_rajkot_returns_200():
    resp = client.post("/api/recommend", json=RAJKOT)
    assert resp.status_code == 200


def test_recommend_rajkot_eligible():
    resp = client.post("/api/recommend", json=RAJKOT)
    data = resp.json()
    assert data["eligible"] is True


def test_recommend_rajkot_scheme_is_term_loan():
    resp = client.post("/api/recommend", json=RAJKOT)
    data = resp.json()
    assert data["recommended_scheme"]["id"] == "term_loan"


def test_recommend_rajkot_response_has_all_contract_fields():
    resp = client.post("/api/recommend", json=RAJKOT)
    data = resp.json()
    for field in ("eligible", "recommended_scheme", "alternative_scheme",
                  "reasons", "rejected_schemes", "ineligibility_reason"):
        assert field in data, f"Missing top-level field: {field}"


def test_recommend_rajkot_recommended_scheme_has_all_fields():
    resp = client.post("/api/recommend", json=RAJKOT)
    scheme = resp.json()["recommended_scheme"]
    for field in ("id", "name", "interest_rate", "max_project_cost",
                  "loan_cap", "loan_percentage", "tenure_months", "moratorium_months"):
        assert field in scheme, f"Missing scheme field: {field}"


def test_recommend_ineligible_income_returns_200_not_error():
    # Ineligible is a valid business outcome, NOT a 4xx/5xx
    payload = {**RAJKOT, "annual_income": 600000}
    resp = client.post("/api/recommend", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["eligible"] is False
    assert data["ineligibility_reason"] is not None


def test_recommend_no_sc_certificate_returns_ineligible():
    payload = {**RAJKOT, "has_sc_certificate": False}
    resp = client.post("/api/recommend", json=payload)
    assert resp.status_code == 200
    assert resp.json()["eligible"] is False


def test_recommend_missing_required_field_returns_422():
    # Drop 'purpose' — Pydantic must reject this
    payload = {k: v for k, v in RAJKOT.items() if k != "purpose"}
    resp = client.post("/api/recommend", json=payload)
    assert resp.status_code == 422


def test_recommend_wrong_type_returns_422():
    # annual_income must be an integer
    payload = {**RAJKOT, "annual_income": "not-a-number"}
    resp = client.post("/api/recommend", json=payload)
    assert resp.status_code == 422


def test_recommend_zero_project_cost_returns_422():
    payload = {**RAJKOT, "project_cost": 0}
    resp = client.post("/api/recommend", json=payload)
    assert resp.status_code == 422


def test_recommend_with_optional_coordinates():
    payload = {**RAJKOT, "latitude": 22.3039, "longitude": 70.8022}
    resp = client.post("/api/recommend", json=payload)
    assert resp.status_code == 200
    assert resp.json()["eligible"] is True


def test_recommend_education_purpose():
    payload = {
        **RAJKOT,
        "purpose": "education",
        "activity_type": "btech",
        "project_cost": 500000,
    }
    resp = client.post("/api/recommend", json=payload)
    assert resp.status_code == 200
    assert resp.json()["recommended_scheme"]["id"] == "educational_loan"


# ══════════════════════════════════════════════════════════════════════════════
# POST /api/calculate
# ══════════════════════════════════════════════════════════════════════════════

def test_calculate_rajkot_returns_200():
    resp = client.post("/api/calculate", json={"scheme_id": "term_loan", "project_cost": 380000})
    assert resp.status_code == 200


def test_calculate_rajkot_correct_loan_amount():
    resp = client.post("/api/calculate", json={"scheme_id": "term_loan", "project_cost": 380000})
    data = resp.json()
    assert data["possible_loan"] == 342000        # min(380000*0.9, 4500000)
    assert data["own_contribution"] == 38000       # 380000 - 342000


def test_calculate_response_has_all_contract_fields():
    resp = client.post("/api/calculate", json={"scheme_id": "term_loan", "project_cost": 380000})
    data = resp.json()
    for field in ("scheme_id", "project_cost", "possible_loan", "own_contribution",
                  "loan_percentage", "interest_rate", "tenure_months",
                  "moratorium_months", "monthly_estimate", "total_repayable", "note"):
        assert field in data, f"Missing field: {field}"


def test_calculate_unknown_scheme_returns_404():
    resp = client.post("/api/calculate", json={"scheme_id": "nonexistent", "project_cost": 100000})
    assert resp.status_code == 404


def test_calculate_missing_field_returns_422():
    resp = client.post("/api/calculate", json={"scheme_id": "term_loan"})
    assert resp.status_code == 422


def test_calculate_total_repayable_equals_emi_times_tenure():
    resp = client.post("/api/calculate", json={"scheme_id": "term_loan", "project_cost": 380000})
    data = resp.json()
    assert data["total_repayable"] == data["monthly_estimate"] * data["tenure_months"]


# ══════════════════════════════════════════════════════════════════════════════
# GET /api/partners
# ══════════════════════════════════════════════════════════════════════════════

def test_partners_rajkot_returns_200():
    resp = client.get("/api/partners", params={
        "state": "Gujarat",
        "district": "Rajkot",
        "scheme_id": "term_loan",
    })
    assert resp.status_code == 200


def test_partners_response_has_contract_fields():
    resp = client.get("/api/partners", params={
        "state": "Gujarat",
        "district": "Rajkot",
        "scheme_id": "term_loan",
    })
    data = resp.json()
    assert "partners" in data
    assert "total" in data
    assert "filter_applied" in data
    assert isinstance(data["partners"], list)
    assert data["total"] == len(data["partners"])


def test_partners_filter_applied_reflects_query():
    resp = client.get("/api/partners", params={
        "state": "Gujarat",
        "district": "Rajkot",
        "scheme_id": "term_loan",
    })
    fa = resp.json()["filter_applied"]
    assert fa["state"] == "Gujarat"
    assert fa["district"] == "Rajkot"
    assert fa["scheme_id"] == "term_loan"


def test_partners_unknown_scheme_returns_404():
    resp = client.get("/api/partners", params={
        "state": "Gujarat",
        "district": "Rajkot",
        "scheme_id": "ghost_scheme",
    })
    assert resp.status_code == 404


def test_partners_with_coordinates_returns_200():
    resp = client.get("/api/partners", params={
        "state": "Gujarat",
        "district": "Rajkot",
        "scheme_id": "term_loan",
        "lat": 22.3039,
        "lon": 70.8022,
    })
    assert resp.status_code == 200


def test_partners_missing_state_returns_422():
    resp = client.get("/api/partners", params={
        "district": "Rajkot",
        "scheme_id": "term_loan",
    })
    assert resp.status_code == 422


# ══════════════════════════════════════════════════════════════════════════════
# Integration journey: recommend → calculate → partners
# ══════════════════════════════════════════════════════════════════════════════

def test_full_rajkot_journey():
    """
    End-to-end integration: enter Rajkot dairy profile once,
    pipe results through all three endpoints.
    No manual copying of data between steps.
    """

    # Step 1 — Recommend
    rec_resp = client.post("/api/recommend", json=RAJKOT)
    assert rec_resp.status_code == 200
    rec = rec_resp.json()
    assert rec["eligible"] is True

    scheme_id   = rec["recommended_scheme"]["id"]
    project_cost = RAJKOT["project_cost"]
    assert scheme_id == "term_loan"

    # Step 2 — Calculate using the recommended scheme
    calc_resp = client.post("/api/calculate", json={
        "scheme_id":    scheme_id,
        "project_cost": project_cost,
    })
    assert calc_resp.status_code == 200
    calc = calc_resp.json()
    assert calc["scheme_id"] == scheme_id
    assert calc["possible_loan"] == 342000
    assert calc["own_contribution"] == 38000

    # Step 3 — Find partners for the recommended scheme
    partners_resp = client.get("/api/partners", params={
        "state":     RAJKOT["state"],
        "district":  RAJKOT["district"],
        "scheme_id": scheme_id,
    })
    assert partners_resp.status_code == 200
    partners_data = partners_resp.json()
    assert isinstance(partners_data["partners"], list)
    # Partners endpoint must not crash even if zero results
    assert partners_data["total"] >= 0
