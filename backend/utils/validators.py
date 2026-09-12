"""
validators.py — Reusable domain validation helpers for the Sahay backend.

These complement the Pydantic schema validators in schemas/ with business-logic
checks that span across multiple fields or require domain knowledge.
"""

NSFDC_INCOME_CEILING = 500_000  # ₹5,00,000 per NSFDC charter
VALID_PURPOSES = {"business", "education"}


def is_income_eligible(annual_income: int) -> bool:
    """Return True if income is within the NSFDC statutory ceiling."""
    return 0 < annual_income <= NSFDC_INCOME_CEILING


def is_valid_purpose(purpose: str) -> bool:
    """Return True if the purpose is a recognised NSFDC loan purpose."""
    return purpose.strip().lower() in VALID_PURPOSES


def sanitize_district(district: str) -> str:
    """
    Sanitize a free-text district input by stripping whitespace.
    Returns an empty string if the district fails basic sanity checks.
    """
    if not district or not isinstance(district, str):
        return ""
    return district.strip()


def is_valid_coordinates(lat: float | None, lon: float | None) -> bool:
    """Return True if both latitude and longitude are within valid WGS-84 bounds."""
    if lat is None or lon is None:
        return False
    return -90 <= lat <= 90 and -180 <= lon <= 180
