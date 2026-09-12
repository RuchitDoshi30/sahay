import pytest
from services.partner_locator import (
    find_partners,
    calculate_distance,
    partner_serves_district,
    scheme_matches,
)
from schemas.partner_models import PartnerResult, PartnersResponse


def test_calculate_distance_haversine():
    # Rajkot center to approx 10km away
    dist = calculate_distance(22.3039, 70.8022, 22.3939, 70.8022)
    assert round(dist, 1) == 10.0


def test_partner_serves_district_exact_match():
    partner = {"District": "Rajkot", "Service Area": "Rajkot Metro"}
    assert partner_serves_district(partner, "Rajkot") is True
    assert partner_serves_district(partner, "rajkot") is True


def test_partner_serves_district_regional_saurashtra():
    partner = {"District": "Rajkot", "Service Area": "Saurashtra Region"}
    assert partner_serves_district(partner, "Morbi") is True
    assert partner_serves_district(partner, "Jamnagar") is True
    assert partner_serves_district(partner, "Surat") is False


def test_scheme_matches_keywords():
    partner = {"Scheme": "Term Loan & Agri Credit"}
    assert scheme_matches(partner, "term loan") is True
    assert scheme_matches(partner, "agri") is True
    assert scheme_matches(partner, "education") is False


def test_find_partners_rajkot_canonical_journey():
    # Canonical hackathon demo query: Ramesh from Rajkot
    results = find_partners(
        state="Gujarat",
        district="Rajkot",
        scheme="term loan",
        latitude=22.3039,
        longitude=70.8022,
    )

    assert len(results) >= 1
    # Top result should be GSCDC Rajkot
    top = results[0]
    assert "GSCDC" in top["name"] or "Gujarat Scheduled Castes" in top["name"]
    assert top["state"] == "Gujarat"
    assert top["district"] == "Rajkot"
    assert top["distance_km"] == 0.0 or top["distance_km"] <= 1.0


def test_find_partners_sorted_by_distance():
    results = find_partners(
        state="Gujarat",
        district="Rajkot",
        scheme="term loan",
        latitude=22.3039,
        longitude=70.8022,
    )

    distances = [p["distance_km"] for p in results if p["distance_km"] is not None]
    assert distances == sorted(distances)


def test_find_partners_invalid_state_returns_empty():
    results = find_partners(
        state="NonExistentState",
        district="Rajkot",
        scheme="term loan",
    )
    assert len(results) == 0


def test_find_partners_validates_against_pydantic_model():
    results = find_partners(
        state="Gujarat",
        district="Rajkot",
        scheme="term loan",
        latitude=22.3039,
        longitude=70.8022,
    )

    validated = [PartnerResult(**p) for p in results]
    response = PartnersResponse(
        partners=validated,
        total=len(validated),
        filter_applied={"state": "Gujarat", "district": "Rajkot", "scheme_id": "term_loan"},
    )
    assert response.total == len(results)
    assert response.partners[0].id is not None


def test_disqualified_partner_excluded_by_fund_guardrail():
    # AU Small Finance Bank (P041 in Rajkot) has fund_available=False (exhausted quota).
    # With require_eligible_funds=True, it MUST be excluded from routing.
    results = find_partners(
        state="Gujarat",
        district="Rajkot",
        scheme="term loan",
        require_eligible_funds=True,
    )
    partner_ids = [p["id"] for p in results]
    assert "P041" not in partner_ids, "Disqualified partner P041 (quota exhausted) must not be routed"

    # With require_eligible_funds=False, it should appear but be tagged
    all_results = find_partners(
        state="Gujarat",
        district="Rajkot",
        scheme="term loan",
        require_eligible_funds=False,
    )
    all_ids = [p["id"] for p in all_results]
    assert "P041" in all_ids


def test_all_routed_partners_have_valid_fund_and_npa_metrics():
    results = find_partners(
        state="Gujarat",
        district="Rajkot",
        scheme="term loan",
        latitude=22.3039,
        longitude=70.8022,
    )
    assert len(results) >= 1
    for p in results:
        assert p["fund_available"] is True, f"{p['name']} must have fund_available=True"
        assert p["no_overdues"] is True, f"{p['name']} must have no_overdues=True"
        assert p["npa_percentage"] <= 5.0, f"{p['name']} NPA must be <= 5.0%"
        assert p["fund_utilization_pct"] > 0
        assert p["eligible_for_routing"] is True


def test_rajkot_gscdc_has_clean_audit_and_active_quota():
    results = find_partners(
        state="Gujarat",
        district="Rajkot",
        scheme="term loan",
        latitude=22.3039,
        longitude=70.8022,
    )
    top = results[0]
    assert top["id"] == "GJ-RJK-001"
    assert top["fund_available"] is True
    assert top["no_overdues"] is True
    assert top["npa_percentage"] == 2.1
    assert top["fund_utilization_pct"] == 88.5
    assert top["rank_score"] == 98
    assert "Active NSFDC fund allocation" in top["reason"]

