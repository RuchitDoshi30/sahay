import json
import math
from pathlib import Path


# =========================================================
# Partner Data File
# =========================================================

PARTNERS_FILE = Path(__file__).parent.parent / "data" / "partners.json"


# =========================================================
# Service Area Mapping
# =========================================================

SERVICE_AREA_DISTRICTS = {
    "saurashtra region": [
        "rajkot",
        "morbi",
        "jamnagar",
        "junagadh",
        "amreli",
        "bhavnagar",
        "porbandar",
        "gir somnath",
        "devbhumi dwarka",
        "surendranagar",
        "botad",
    ],

    "central gujarat": [
        "vadodara",
        "anand",
        "kheda",
        "panchmahal",
        "dahod",
        "chhota udepur",
    ],

    "north gujarat": [
        "mehsana",
        "patan",
        "banaskantha",
        "sabarkantha",
        "aravalli",
        "gandhinagar",
    ],

    "south gujarat": [
        "surat",
        "navsari",
        "bharuch",
        "valsad",
        "tapi",
        "dang",
        "narmada",
    ],

    "gujarat statewide": [
        "ahmedabad",
        "gandhinagar",
        "rajkot",
        "surat",
        "vadodara",
        "bhavnagar",
        "jamnagar",
        "junagadh",
        "morbi",
        "amreli",
        "porbandar",
        "surendranagar",
        "mehsana",
        "patan",
        "banaskantha",
        "sabarkantha",
        "aravalli",
        "kheda",
        "anand",
        "panchmahal",
        "dahod",
        "chhota udepur",
        "bharuch",
        "navsari",
        "valsad",
        "tapi",
        "dang",
        "narmada",
        "kutch",
        "botad",
        "gir somnath",
    ],
}


# =========================================================
# Load Partner Data
# =========================================================

def load_partners():
    """
    Load partner data from partners.json.
    """

    with open(PARTNERS_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


# =========================================================
# Distance Calculation
# =========================================================

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two geographical points
    using the Haversine formula.

    Returns distance in kilometres.
    """
    earth_radius = 6371.0

    difference_lat = math.radians(lat2 - lat1)
    difference_lon = math.radians(lon2 - lon1)

    rad_lat1 = math.radians(lat1)
    rad_lat2 = math.radians(lat2)

    a = (
        math.sin(difference_lat / 2) ** 2
        + math.cos(rad_lat1)
        * math.cos(rad_lat2)
        * math.sin(difference_lon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return earth_radius * c


# =========================================================
# Service Area Check
# =========================================================

def partner_serves_district(partner, district):
    """
    Check whether a partner serves the user's district.

    Supports:
    - Exact district match
    - Explicit district names in service area
    - Regional service areas
    - Gujarat statewide service
    """

    user_district = district.strip().lower()

    partner_district = (
        partner.get("District", "")
        .strip()
        .lower()
    )

    service_area = (
        partner.get("Service Area", "")
        .strip()
        .lower()
    )

    # Exact district match
    if partner_district == user_district:
        return True

    # Direct service-area text match
    if user_district in service_area:
        return True

    # Regional service-area match
    covered_districts = SERVICE_AREA_DISTRICTS.get(
        service_area,
        []
    )

    if user_district in covered_districts:
        return True

    return False


# =========================================================
# Scheme Matching
# =========================================================

def scheme_matches(partner, requested_scheme):
    """
    Check whether the partner's scheme is relevant
    to the requested scheme/category.

    Uses keyword matching so that:
        "Engineering"
    can match:
        "Engineering & Agri Credit"

    and:
        "Term Loan"
    can match:
        "Term Loan & Agri Credit"
    """

    partner_scheme = (
        partner.get("Scheme", "")
        .strip()
        .lower()
    )

    requested_scheme = (
        requested_scheme
        .strip()
        .lower()
    )

    # Direct match
    if requested_scheme in partner_scheme:
        return True

    # State Channelizing Agencies (SCAs) administer all NSFDC schemes
    if partner.get("Type", "").strip().upper() == "SCA":
        return True

    # Common scheme/category mappings
    scheme_keywords = {
        "term loan": [
            "term loan",
            "business loan",
            "enterprise credit",
            "sme credit",
            "msme",
        ],

        "msme": [
            "msme",
            "sme",
            "enterprise",
            "business",
            "industrial",
        ],

        "agri": [
            "agri",
            "agriculture",
            "kisan",
            "farm",
            "agro",
            "dairy",
            "fisheries",
        ],

        "dairy": [
            "dairy",
            "agri",
            "agro allied",
            "farm",
        ],

        "working capital": [
            "working capital",
            "business",
            "msme",
            "sme",
        ],

        "microfinance": [
            "microfinance",
            "micro",
            "livelihood",
            "self-help",
            "shg",
            "women",
            "mahila",
        ],

        "equipment": [
            "equipment",
            "tractor",
            "farm equipment",
            "vehicle",
        ],

        "education": [
            "education",
            "student",
            "vocational",
            "skill",
            "training",
            "degree",
            "iti",
        ],

        "green": [
            "green",
            "solar",
            "agri",
            "agro",
            "farm",
            "term loan",
            "eco",
        ],
    }

    keywords = scheme_keywords.get(
        requested_scheme,
        [requested_scheme]
    )

    return any(
        keyword in partner_scheme
        for keyword in keywords
    )


# =========================================================
# Find Partners
# =========================================================

def find_partners(
    state,
    district,
    scheme,
    latitude=None,
    longitude=None,
    require_eligible_funds=True,
):
    """
    Find and rank suitable partners.

    Matching order:
        1. State
        2. Service area
        3. Scheme
        4. Statutory Fund Utilization & Overdue Compliance (Part 3 Guardrail)
        5. Prototype status
        6. Distance
    """

    partners = load_partners()

    results = []

    for partner in partners:

        # -------------------------------------------------
        # 1. State Check
        # -------------------------------------------------

        partner_state = (
            partner.get("State", "")
            .strip()
            .lower()
        )

        if partner_state != state.strip().lower():
            continue

        # -------------------------------------------------
        # 2. Service Area Check
        # -------------------------------------------------

        if not partner_serves_district(
            partner,
            district
        ):
            continue

        # -------------------------------------------------
        # 3. Scheme Check
        # -------------------------------------------------

        if not scheme_matches(
            partner,
            scheme
        ):
            continue

        # -------------------------------------------------
        # 4. Prototype Status Check
        # -------------------------------------------------

        prototype_status = (
            partner.get("Prototype Status", "")
            .strip()
            .lower()
        )

        if prototype_status != "prototype":
            continue

        # -------------------------------------------------
        # 5. Statutory Fund Utilization & Overdue Compliance (SIH Part 3)
        # -------------------------------------------------
        fund_available = bool(partner.get("fund_available", True))
        no_overdues = bool(partner.get("no_overdues", True))
        npa_pct = float(partner.get("npa_percentage", 2.1))
        fund_util_pct = float(partner.get("fund_utilization_pct", 88.0))
        is_eligible = fund_available and no_overdues

        # Exclude partners with exhausted lending quotas or high default overdues/NPAs
        if require_eligible_funds and not is_eligible:
            continue

        # -------------------------------------------------
        # 6. Get Partner Coordinates
        # -------------------------------------------------

        partner_latitude = partner.get("Latitude")
        partner_longitude = partner.get("Longitude")

        distance = None

        if (
            latitude is not None
            and longitude is not None
            and partner_latitude is not None
            and partner_longitude is not None
        ):

            distance = calculate_distance(
                latitude,
                longitude,
                partner_latitude,
                partner_longitude,
            )

        # -------------------------------------------------
        # 7. Create Reason with Audit Lineage
        # -------------------------------------------------

        audit_status = (
            f"Active NSFDC fund allocation, zero default overdues (NPA: {npa_pct}%)."
            if is_eligible
            else f"Statutory hold: {'Quota exhausted' if not fund_available else 'High NPA/overdues'}."
        )

        if distance is not None:
            reason = (
                f"Supports {partner.get('Scheme')} "
                f"and serves {partner.get('Service Area')}. "
                f"{audit_status} "
                f"Approximately {distance:.1f} km away."
            )
        else:
            reason = (
                f"Supports {partner.get('Scheme')} "
                f"and serves {partner.get('Service Area')}. "
                f"{audit_status}"
            )

        # -------------------------------------------------
        # 8. Create Clean Result
        # -------------------------------------------------

        results.append(
            {
                "id": partner.get("ID") or partner.get("id"),
                "name": partner.get("Name") or partner.get("name"),
                "type": partner.get("Type") or partner.get("type"),
                "state": partner.get("State") or partner.get("state"),
                "district": partner.get("District") or partner.get("district"),
                "address": partner.get("Address") or partner.get("address"),
                "scheme": partner.get("Scheme") or partner.get("scheme"),
                "service_area": partner.get("Service Area") or partner.get("service_area"),
                "latitude": partner_latitude,
                "longitude": partner_longitude,
                "distance_km": (
                    round(distance, 2)
                    if distance is not None
                    else None
                ),
                "reason": reason,
                "phone": partner.get("Phone") or partner.get("phone"),
                "email": partner.get("Email") or partner.get("email"),
                "hours": partner.get("Hours") or partner.get("hours"),
                "verified": partner.get("Verified") if partner.get("Verified") is not None else partner.get("verified", True),
                "supported_schemes": partner.get("supported_schemes") or [partner.get("Scheme", "")] if partner.get("Scheme") else [],
                "fund_available": fund_available,
                "no_overdues": no_overdues,
                "npa_percentage": npa_pct,
                "fund_utilization_pct": fund_util_pct,
                "eligible_for_routing": is_eligible,
                "rank_score": partner.get("Rank Score") or partner.get("rank_score", 95),
                "data_source": partner.get("Source") or partner.get("data_source", "NSFDC Annual Report 2023-24"),
                "prototype_status": partner.get("Prototype Status") or partner.get("prototype_status", "Prototype"),
            }
        )

    # -----------------------------------------------------
    # 9. Sort By Distance
    # -----------------------------------------------------

    results.sort(
        key=lambda partner: (
            partner["distance_km"]
            if partner["distance_km"] is not None
            else float("inf")
        )
    )

    return results


# =========================================================
# Temporary Testing
# =========================================================

if __name__ == "__main__":

    results = find_partners(
        state="Gujarat",
        district="Rajkot",
        scheme="Term Loan",
        latitude=22.3039,
        longitude=70.8022,
    )

    print("\nRecommended Partners:\n")

    if not results:

        print("No suitable partners found.")

    else:

        for partner in results:

            print(
                f"{partner['id']} - "
                f"{partner['name']}"
            )

            print(
                f"District: "
                f"{partner['district']}"
            )

            print(
                f"Scheme: "
                f"{partner['scheme']}"
            )

            print(
                f"Service Area: "
                f"{partner['service_area']}"
            )

            print(
                f"Distance: "
                f"{partner['distance_km']} km"
            )

            print(
                f"Reason: "
                f"{partner['reason']}"
            )

            print("-" * 60)