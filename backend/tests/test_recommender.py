"""
test_recommender.py  —  Sahay SIH26092
Unit tests for services/recommender.py

Coverage:
  A. Rajkot dairy happy path
  B. Income boundary (500000 / 500001)
  C. Project-cost boundary (140000 / 140001)
  D. SC certificate variations
  E. Purpose routing (business / education)
  F. Alternative scheme presence/absence
  G. Deterministic output (same input → same output)
  H. Invalid purpose
  I. Project cost exceeds all scheme ceilings
  J. Education cost ceiling
  K. Ineligible response shape
"""

import pytest
from services.recommender import recommend

# ─── Shared base profile ────────────────────────────────────────────────────────
# All tests start from this valid Rajkot dairy profile and override only the
# field under test. This keeps tests focused and easy to read.

BASE = {
    "has_sc_certificate": True,
    "annual_income": 300_000,
    "purpose": "business",
    "project_cost": 380_000,
    "activity_type": "dairy",
    "state": "Gujarat",
    "district": "Rajkot",
    "latitude": None,
    "longitude": None,
}


def profile(**overrides):
    """Return a copy of BASE with given fields overridden."""
    return {**BASE, **overrides}


# ─── A. Rajkot dairy happy path ────────────────────────────────────────────────

def test_rajkot_dairy_recommends_term_loan():
    result = recommend(BASE)
    assert result["eligible"] is True
    assert result["recommended_scheme"]["id"] == "term_loan"


def test_rajkot_dairy_alternative_is_udyam_nidhi():
    result = recommend(BASE)
    assert result["alternative_scheme"] is not None
    assert result["alternative_scheme"]["id"] == "udyam_nidhi"


def test_rajkot_dairy_has_reasons():
    result = recommend(BASE)
    assert len(result["reasons"]) >= 1
    # All reasons must be non-empty strings
    for reason in result["reasons"]:
        assert isinstance(reason, str) and len(reason) > 0


def test_rajkot_dairy_has_rejected_schemes():
    result = recommend(BASE)
    assert len(result["rejected_schemes"]) >= 1
    rejected_ids = [r["scheme_id"] for r in result["rejected_schemes"]]
    # micro_finance must be rejected (cost too high for micro)
    assert "micro_finance" in rejected_ids
    # educational_loan must be rejected (purpose is business)
    assert "educational_loan" in rejected_ids


def test_rajkot_dairy_no_ineligibility_reason():
    result = recommend(BASE)
    assert result["ineligibility_reason"] is None


def test_rajkot_dairy_recommended_scheme_has_all_fields():
    result = recommend(BASE)
    scheme = result["recommended_scheme"]
    for field in ("id", "name", "interest_rate", "max_project_cost",
                  "loan_cap", "loan_percentage", "tenure_months", "moratorium_months"):
        assert field in scheme, f"Missing field: {field}"


# ─── B. Income boundary ────────────────────────────────────────────────────────

def test_income_exactly_at_ceiling_is_eligible():
    # ₹5,00,000 exactly must be accepted
    result = recommend(profile(annual_income=500_000))
    assert result["eligible"] is True
    assert result["recommended_scheme"] is not None


def test_income_one_rupee_over_ceiling_is_ineligible():
    # ₹5,00,001 must be rejected
    result = recommend(profile(annual_income=500_001))
    assert result["eligible"] is False
    assert result["recommended_scheme"] is None
    assert result["ineligibility_reason"] is not None
    assert "500001" in result["ineligibility_reason"] or "5,00,001" in result["ineligibility_reason"]


def test_income_well_above_ceiling_is_ineligible():
    result = recommend(profile(annual_income=1_000_000))
    assert result["eligible"] is False


def test_income_zero_would_be_caught_by_schema():
    # annual_income=0 is blocked by Pydantic (gt=0) before reaching recommender.
    # We just confirm recommender itself handles very low income fine.
    result = recommend(profile(annual_income=1))
    assert result["eligible"] is True


# ─── C. Project-cost boundary ──────────────────────────────────────────────────

def test_project_cost_exactly_at_micro_ceiling_gives_micro_finance():
    # ₹1,40,000 exactly → micro_finance (boundary is inclusive)
    result = recommend(profile(project_cost=140_000))
    assert result["eligible"] is True
    assert result["recommended_scheme"]["id"] == "micro_finance"


def test_project_cost_one_rupee_over_micro_ceiling_gives_term_loan():
    # ₹1,40,001 → term_loan
    result = recommend(profile(project_cost=140_001))
    assert result["eligible"] is True
    assert result["recommended_scheme"]["id"] == "term_loan"


def test_project_cost_small_gives_aajeevika_as_alternative():
    # For small projects, alternative should be aajeevika_microfinance
    result = recommend(profile(project_cost=100_000))
    assert result["alternative_scheme"]["id"] == "aajeevika_microfinance"


def test_project_cost_at_udyam_ceiling_gives_udyam_as_alternative():
    # ₹5,00,000 → term_loan primary, udyam_nidhi as alternative (fits udyam ceiling)
    result = recommend(profile(project_cost=500_000))
    assert result["recommended_scheme"]["id"] == "term_loan"
    assert result["alternative_scheme"]["id"] == "udyam_nidhi"


def test_project_cost_above_udyam_ceiling_has_no_alternative():
    # ₹5,00,001 → term_loan primary, NO alternative (too big for udyam)
    result = recommend(profile(project_cost=500_001))
    assert result["recommended_scheme"]["id"] == "term_loan"
    assert result["alternative_scheme"] is None


def test_project_cost_exceeds_all_schemes_is_ineligible():
    # ₹5,00,00,001 (₹50L + 1) → no scheme can cover it
    result = recommend(profile(project_cost=5_000_001))
    assert result["eligible"] is False
    assert result["ineligibility_reason"] is not None


# ─── D. SC certificate ─────────────────────────────────────────────────────────

def test_no_sc_certificate_is_ineligible():
    result = recommend(profile(has_sc_certificate=False))
    assert result["eligible"] is False
    assert result["recommended_scheme"] is None
    assert result["ineligibility_reason"] is not None


def test_no_sc_certificate_has_empty_reasons():
    result = recommend(profile(has_sc_certificate=False))
    assert result["reasons"] == []
    assert result["rejected_schemes"] == []


def test_sc_certificate_true_passes_gate():
    result = recommend(profile(has_sc_certificate=True))
    assert result["eligible"] is True


# ─── E. Purpose routing ────────────────────────────────────────────────────────

def test_education_purpose_recommends_educational_loan():
    result = recommend(profile(
        purpose="education",
        activity_type="btech",
        project_cost=500_000,
    ))
    assert result["eligible"] is True
    assert result["recommended_scheme"]["id"] == "educational_loan"


def test_education_purpose_rejects_all_business_schemes():
    result = recommend(profile(
        purpose="education",
        activity_type="btech",
        project_cost=500_000,
    ))
    rejected_ids = [r["scheme_id"] for r in result["rejected_schemes"]]
    for sid in ("micro_finance", "aajeevika_microfinance", "term_loan", "udyam_nidhi"):
        assert sid in rejected_ids, f"{sid} should be in rejected_schemes for education purpose"


def test_business_purpose_rejects_educational_loan():
    result = recommend(BASE)
    rejected_ids = [r["scheme_id"] for r in result["rejected_schemes"]]
    assert "educational_loan" in rejected_ids


def test_invalid_purpose_is_ineligible():
    result = recommend(profile(purpose="travel"))
    assert result["eligible"] is False
    assert result["ineligibility_reason"] is not None
    assert "travel" in result["ineligibility_reason"]


def test_purpose_case_insensitive():
    # "Business" and "EDUCATION" should be treated the same as lowercase
    result_biz = recommend(profile(purpose="Business"))
    assert result_biz["eligible"] is True
    assert result_biz["recommended_scheme"]["id"] == "term_loan"

    result_edu = recommend(profile(purpose="Education", activity_type="btech", project_cost=200_000))
    assert result_edu["eligible"] is True
    assert result_edu["recommended_scheme"]["id"] == "educational_loan"


# ─── F. Alternative scheme presence / absence ──────────────────────────────────

def test_education_has_no_alternative():
    result = recommend(profile(purpose="education", activity_type="btech", project_cost=100_000))
    assert result["alternative_scheme"] is None


def test_large_business_project_has_no_alternative():
    result = recommend(profile(project_cost=1_000_000))
    assert result["recommended_scheme"]["id"] == "term_loan"
    assert result["alternative_scheme"] is None


# ─── G. Deterministic output ───────────────────────────────────────────────────

def test_same_input_always_produces_same_output():
    result1 = recommend(BASE)
    result2 = recommend(BASE)
    assert result1["recommended_scheme"]["id"] == result2["recommended_scheme"]["id"]
    assert result1["reasons"] == result2["reasons"]
    assert result1["eligible"] == result2["eligible"]


# ─── H. Ineligible response shape ──────────────────────────────────────────────

def test_ineligible_response_has_correct_shape():
    result = recommend(profile(has_sc_certificate=False))
    assert result["eligible"] is False
    assert result["recommended_scheme"] is None
    assert result["alternative_scheme"] is None
    assert result["reasons"] == []
    assert result["rejected_schemes"] == []
    assert isinstance(result["ineligibility_reason"], str)


# ─── I. Education cost ceiling ─────────────────────────────────────────────────

def test_education_cost_within_ceiling_is_eligible():
    result = recommend(profile(purpose="education", activity_type="mba", project_cost=4_000_000))
    assert result["eligible"] is True
    assert result["recommended_scheme"]["id"] == "educational_loan"


def test_education_cost_exceeds_ceiling_is_ineligible():
    result = recommend(profile(purpose="education", activity_type="mba", project_cost=4_000_001))
    assert result["eligible"] is False
    assert result["ineligibility_reason"] is not None


# ─── J. Rejected scheme shape ──────────────────────────────────────────────────

def test_each_rejected_scheme_has_required_fields():
    result = recommend(BASE)
    for r in result["rejected_schemes"]:
        assert "scheme_id" in r
        assert "scheme_name" in r
        assert "rejection_reason" in r
        assert len(r["rejection_reason"]) > 0


# ─── K. New Scheme Coverage (Mahila Samridhi, Green Business, Vocational) ─────

def test_female_small_project_recommends_mahila_samridhi():
    # Female SC applicant with cost <= 140,000 gets Mahila Samridhi (5% p.a.)
    res = recommend(profile(project_cost=100_000, gender="female"))
    assert res["eligible"] is True
    assert res["recommended_scheme"]["id"] == "mahila_samridhi"
    assert res["recommended_scheme"]["interest_rate"] == 5.0
    assert res["alternative_scheme"]["id"] == "micro_finance"


def test_male_small_project_gives_micro_finance_not_mahila():
    # Male SC applicant with cost <= 140,000 gets Micro Finance (6.5% p.a.), alt is aajeevika
    res = recommend(profile(project_cost=100_000, gender="male"))
    assert res["eligible"] is True
    assert res["recommended_scheme"]["id"] == "micro_finance"
    assert res["recommended_scheme"]["interest_rate"] == 6.5
    assert res["alternative_scheme"]["id"] == "aajeevika_microfinance"
    # Mahila Samridhi should be in rejected schemes for non-female
    rejected_ids = [r["scheme_id"] for r in res["rejected_schemes"]]
    assert "mahila_samridhi" in rejected_ids


def test_green_activity_large_project_recommends_green_business():
    # Eco/green business with cost > 140,000 gets Green Business Scheme (6% p.a., 84 mo)
    res = recommend(profile(project_cost=400_000, activity_type="solar panel installation"))
    assert res["eligible"] is True
    assert res["recommended_scheme"]["id"] == "green_business"
    assert res["recommended_scheme"]["interest_rate"] == 6.0
    assert res["recommended_scheme"]["tenure_months"] == 84


def test_non_green_activity_large_project_gives_term_loan():
    # General non-green business with cost > 140,000 gets Term Loan (8% p.a., 60 mo)
    res = recommend(profile(project_cost=400_000, activity_type="grocery retail store"))
    assert res["eligible"] is True
    assert res["recommended_scheme"]["id"] == "term_loan"
    assert res["recommended_scheme"]["interest_rate"] == 8.0


def test_vocational_education_small_cost_recommends_vocational():
    # Vocational / skill course with cost <= 500,000 gets Vocational Education Loan (6.5% p.a., 60 mo)
    res = recommend(profile(
        purpose="education",
        activity_type="iti vocational training",
        project_cost=300_000,
    ))
    assert res["eligible"] is True
    assert res["recommended_scheme"]["id"] == "vocational_education"
    assert res["alternative_scheme"]["id"] == "educational_loan"


def test_large_education_cost_gives_educational_loan():
    # Education cost > 500,000 gets Educational Loan even if vocational
    res = recommend(profile(
        purpose="education",
        activity_type="iti vocational training",
        project_cost=1_500_000,
    ))
    assert res["eligible"] is True
    assert res["recommended_scheme"]["id"] == "educational_loan"

