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

    earth_radius = 6371

    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)

    difference_lat = math.radians(lat2 - lat1)
    difference_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(difference_lat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
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
        ],

        "equipment": [
            "equipment",
            "tractor",
            "farm equipment",
            "vehicle",
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
):
    """
    Find and rank suitable partners.

    Matching order:
        1. State
        2. Service area
        3. Scheme
        4. Prototype status
        5. Distance
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
        # 5. Get Partner Coordinates
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
        # 6. Create Reason
        # -------------------------------------------------

        if distance is not None:

            reason = (
                f"Supports {partner.get('Scheme')} "
                f"and serves {partner.get('Service Area')}. "
                f"Approximately {distance:.1f} km away."
            )

        else:

            reason = (
                f"Supports {partner.get('Scheme')} "
                f"and serves {partner.get('Service Area')}."
            )

        # -------------------------------------------------
        # 7. Create Clean Result
        # -------------------------------------------------

        results.append(
            {
                "id": partner.get("ID"),
                "name": partner.get("Name"),
                "type": partner.get("Type"),
                "state": partner.get("State"),
                "district": partner.get("District"),
                "address": partner.get("Address"),
                "scheme": partner.get("Scheme"),
                "service_area": partner.get("Service Area"),
                "latitude": partner_latitude,
                "longitude": partner_longitude,
                "distance_km": (
                    round(distance, 2)
                    if distance is not None
                    else None
                ),
                "reason": reason,
            }
        )

    # -----------------------------------------------------
    # 8. Sort By Distance
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