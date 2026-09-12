"""
recommender.py  —  Sahay SIH26092
Owner: Pair 1 / Ruchit

Deterministic scheme recommendation engine.

Given a frozen user profile, this module decides:
  - which NSFDC scheme best fits the user
  - the next-best alternative where one exists
  - plain-language reasons for the recommendation
  - which schemes were considered and why they were ruled out
  - whether the user clears baseline eligibility at all

All thresholds come from schemes.json or from the policy constants below.
Same input always produces the same output (no randomness, no ML/LLM).

Separation of concerns:
  recommender.py  →  WHICH scheme?
  calculator.py   →  HOW MUCH?
  partner_locator.py  →  WHICH partners?
"""

from utils.loaders import load_schemes

# ─── Policy constants ──────────────────────────────────────────────────────────
# These are NSFDC programme eligibility rules that apply across all schemes.
# Source: SIH26092_Document_1_Project_Clarity.pdf, Section 2.
# If the ceiling changes, update here and log in docs/decision-log.md.

INCOME_CEILING = 500_000          # Annual family income must not exceed ₹5,00,000

VALID_PURPOSES = {"business", "education"}

GREEN_KEYWORDS = (
    "green", "solar", "organic", "rickshaw", "electric", "battery",
    "polyhouse", "greenhouse", "waste", "recycling", "sanitation", "eco",
)

VOCATIONAL_KEYWORDS = (
    "vocational", "iti", "skill", "diploma", "training", "certificate", "polytechnic",
)


# ─── Helpers ───────────────────────────────────────────────────────────────────

def _fmt_inr(amount: int) -> str:
    """Format an integer rupee amount as a readable Indian string, e.g. 380000 → ₹3,80,000."""
    s = str(amount)
    if len(s) <= 3:
        return f"₹{s}"
    last3 = s[-3:]
    rest = s[:-3]
    groups = []
    while len(rest) > 2:
        groups.append(rest[-2:])
        rest = rest[:-2]
    if rest:
        groups.append(rest)
    return "₹" + ",".join(reversed(groups)) + "," + last3


def _scheme_as_dict(scheme: dict) -> dict:
    """
    Return only the fields that belong in SchemeInfo.
    Keeps the response shape consistent with api-contract.md
    even if schemes.json grows extra fields in future.
    """
    return {
        "id":                scheme["id"],
        "name":              scheme["name"],
        "interest_rate":     scheme["interest_rate"],
        "max_project_cost":  scheme["max_project_cost"],
        "loan_cap":          scheme["loan_cap"],
        "loan_percentage":   scheme["loan_percentage"],
        "tenure_months":     scheme["tenure_months"],
        "moratorium_months": scheme["moratorium_months"],
    }


def _is_green_activity(activity: str) -> bool:
    act = activity.lower().replace("-", " ").replace("_", " ")
    return any(k in act for k in GREEN_KEYWORDS)


def _is_vocational_course(activity: str) -> bool:
    act = activity.lower().replace("-", " ").replace("_", " ")
    return any(k in act for k in VOCATIONAL_KEYWORDS)


# ─── Main public function ──────────────────────────────────────────────────────

def recommend(profile: dict) -> dict:
    """
    Evaluate a user profile and return a recommendation result.

    Parameters
    ----------
    profile : dict
        Contains fields from ProfileRequest.
        Caller (route) is responsible for schema validation before calling this.

    Returns
    -------
    dict matching the shape of RecommendationResponse:
        eligible            bool
        recommended_scheme  dict | None
        alternative_scheme  dict | None
        reasons             list[str]
        rejected_schemes    list[dict]
        ineligibility_reason  str | None
    """

    schemes = load_schemes()   # { scheme_id: scheme_dict } from schemes.json

    has_sc    = profile["has_sc_certificate"]
    income    = profile["annual_income"]
    purpose   = profile["purpose"].strip().lower()
    cost      = profile["project_cost"]
    activity  = profile["activity_type"].strip()
    gender    = str(profile.get("gender") or "").strip().lower()

    rejected_schemes = []

    # ── Step 1: SC certificate check ──────────────────────────────────────────
    if not has_sc:
        return _ineligible(
            "Applicant does not hold a valid SC/ST certificate. "
            "NSFDC schemes are available only to Scheduled Caste beneficiaries."
        )

    # ── Step 2: Income ceiling check ──────────────────────────────────────────
    if income > INCOME_CEILING:
        return _ineligible(
            f"Annual income {_fmt_inr(income)} exceeds the maximum eligibility "
            f"ceiling of {_fmt_inr(INCOME_CEILING)}."
        )

    # ── Step 3: Purpose check ─────────────────────────────────────────────────
    if purpose not in VALID_PURPOSES:
        return _ineligible(
            f"Purpose '{profile['purpose']}' is not supported. "
            f"Accepted values: 'business' or 'education'."
        )

    # ── Step 4: Route by purpose ──────────────────────────────────────────────
    if purpose == "education":
        return _recommend_education(schemes, income, cost, activity, rejected_schemes)

    # purpose == "business"
    return _recommend_business(schemes, income, cost, activity, gender, rejected_schemes)


# ─── Education path ────────────────────────────────────────────────────────────

def _recommend_education(schemes, income, cost, activity, rejected_schemes):
    """
    Education journey:
      - educational_loan (higher education up to ₹40L)
      - vocational_education (vocational / ITI / skill course up to ₹5L)
    Business schemes are always rejected for an education purpose.
    """

    edu = schemes["educational_loan"]
    voc = schemes.get("vocational_education")

    # Reject all business schemes — wrong purpose
    for sid in ("micro_finance", "mahila_samridhi", "aajeevika_microfinance", "term_loan", "green_business", "udyam_nidhi"):
        if sid in schemes:
            s = schemes[sid]
            rejected_schemes.append({
                "scheme_id":        sid,
                "scheme_name":      s["name"],
                "rejection_reason": "Purpose is 'education', not 'business'.",
            })

    # Check whether the course cost exceeds the highest educational loan ceiling
    if cost > edu["max_project_cost"]:
        return _ineligible(
            f"Course cost {_fmt_inr(cost)} exceeds the Educational Loan ceiling "
            f"of {_fmt_inr(edu['max_project_cost'])}."
        )

    # If course is vocational/skill and fits within vocational education ceiling:
    if voc and _is_vocational_course(activity) and cost <= voc["max_project_cost"]:
        reasons = [
            f"Course cost of {_fmt_inr(cost)} is within the Vocational Education Loan "
            f"ceiling of {_fmt_inr(voc['max_project_cost'])}.",
            f"Tailored for skill development and vocational training courses ({activity}).",
            f"Annual income of {_fmt_inr(income)} is within the "
            f"{_fmt_inr(INCOME_CEILING)} eligibility ceiling.",
            f"Offers a focused {voc['tenure_months']}-month tenure with concessional interest rate of {voc['interest_rate']}% p.a.",
        ]
        return _eligible(
            recommended=voc,
            alternative=edu,
            reasons=reasons,
            rejected_schemes=rejected_schemes,
        )

    # Higher education / Degree course (or cost > ₹5L)
    if voc:
        if cost > voc["max_project_cost"]:
            rejected_schemes.append({
                "scheme_id":        "vocational_education",
                "scheme_name":      voc["name"],
                "rejection_reason": (
                    f"Course cost {_fmt_inr(cost)} exceeds the Vocational Education Loan "
                    f"ceiling of {_fmt_inr(voc['max_project_cost'])}."
                ),
            })
        else:
            rejected_schemes.append({
                "scheme_id":        "vocational_education",
                "scheme_name":      voc["name"],
                "rejection_reason": "Course is regular higher education/degree rather than vocational skill training.",
            })

    reasons = [
        f"Course cost of {_fmt_inr(cost)} is within the Educational Loan "
        f"ceiling of {_fmt_inr(edu['max_project_cost'])}.",
        f"Annual income of {_fmt_inr(income)} is within the "
        f"{_fmt_inr(INCOME_CEILING)} eligibility ceiling.",
        "Educational Loan supports higher education and vocational courses "
        "for SC beneficiaries.",
    ]

    return _eligible(
        recommended=edu,
        alternative=None,
        reasons=reasons,
        rejected_schemes=rejected_schemes,
    )


# ─── Business path ─────────────────────────────────────────────────────

def _recommend_business(schemes, income, cost, activity, gender, rejected_schemes):
    """
    Business journey:
      Branch A: Small project (cost <= micro_ceiling = ₹1,40,000)
        - If female: recommend mahila_samridhi (5.0% p.a., lowest rate), alt: micro_finance
        - If not female: recommend micro_finance (6.5% p.a.), alt: aajeevika_microfinance
      Branch B: Larger project (₹1,40,000 < cost <= ₹50,00,000)
        - If green/eco activity: recommend green_business (6.0% p.a., 84 mo), alt: udyam_nidhi (if cost <= 5L) else term_loan
        - If other activity: recommend term_loan (8.0% p.a., 60 mo), alt: udyam_nidhi (if cost <= 5L)
      Branch C: cost > ₹50,00,000 -> Ineligible
    """

    micro     = schemes["micro_finance"]
    mahila    = schemes.get("mahila_samridhi")
    aajeevika = schemes["aajeevika_microfinance"]
    term      = schemes["term_loan"]
    green     = schemes.get("green_business")
    udyam     = schemes["udyam_nidhi"]
    edu       = schemes["educational_loan"]
    voc       = schemes.get("vocational_education")

    micro_ceiling = micro["max_project_cost"]   # ₹1,40,000 from schemes.json
    term_ceiling  = term["max_project_cost"]    # ₹50,00,000 from schemes.json
    udyam_ceiling = udyam["max_project_cost"]   # ₹5,00,000 from schemes.json

    # Educational loans are always rejected for a business purpose
    rejected_schemes.append({
        "scheme_id":        "educational_loan",
        "scheme_name":      edu["name"],
        "rejection_reason": "Purpose is 'business', not 'education'.",
    })
    if voc:
        rejected_schemes.append({
            "scheme_id":        "vocational_education",
            "scheme_name":      voc["name"],
            "rejection_reason": "Purpose is 'business', not 'education'.",
        })

    # ── Branch A: Small project (cost ≤ ₹1,40,000) ───────────────────────────
    if cost <= micro_ceiling:
        # term_loan, green_business, and udyam_nidhi rejected — project too small
        rejected_schemes.append({
            "scheme_id":        "term_loan",
            "scheme_name":      term["name"],
            "rejection_reason": (
                f"Project cost {_fmt_inr(cost)} is within the Micro Finance range "
                f"(up to {_fmt_inr(micro_ceiling)}). Term Loan is for larger projects."
            ),
        })
        if green:
            rejected_schemes.append({
                "scheme_id":        "green_business",
                "scheme_name":      green["name"],
                "rejection_reason": (
                    f"Project cost {_fmt_inr(cost)} is within the Micro Finance range. "
                    "Green Business Scheme is designed for larger scale enterprise projects."
                ),
            })
        rejected_schemes.append({
            "scheme_id":        "udyam_nidhi",
            "scheme_name":      udyam["name"],
            "rejection_reason": (
                f"Project cost {_fmt_inr(cost)} is within the Micro Finance range. "
                "Udyam Nidhi targets projects above the micro-finance ceiling."
            ),
        })

        if gender == "female" and mahila:
            # Female entrepreneur qualifies for Mahila Samridhi at 5.0%
            rejected_schemes.append({
                "scheme_id":        "aajeevika_microfinance",
                "scheme_name":      aajeevika["name"],
                "rejection_reason": (
                    f"Aajeevika interest rate ({aajeevika['interest_rate']}% p.a.) is higher than "
                    f"Mahila Samridhi Yojana ({mahila['interest_rate']}% p.a.)."
                ),
            })

            reasons = [
                f"Project cost of {_fmt_inr(cost)} qualifies for the Mahila Samridhi Yojana "
                f"(up to {_fmt_inr(mahila['max_project_cost'])}).",
                "Exclusively reserved for women entrepreneurs from the Scheduled Caste community.",
                f"Offers NSFDC's lowest concessional interest rate of {mahila['interest_rate']}% p.a.",
                f"Annual income of {_fmt_inr(income)} is within the "
                f"{_fmt_inr(INCOME_CEILING)} eligibility ceiling.",
            ]

            return _eligible(
                recommended=mahila,
                alternative=micro,
                reasons=reasons,
                rejected_schemes=rejected_schemes,
            )

        # Non-female or gender not provided
        if mahila:
            rejected_schemes.append({
                "scheme_id":        "mahila_samridhi",
                "scheme_name":      mahila["name"],
                "rejection_reason": "Mahila Samridhi Yojana is exclusively reserved for women entrepreneurs.",
            })

        reasons = [
            f"Project cost of {_fmt_inr(cost)} is within the Micro Finance "
            f"limit of {_fmt_inr(micro_ceiling)}.",
            f"Business activity ({activity}) is supported under this scheme.",
            f"Annual income of {_fmt_inr(income)} is within the "
            f"{_fmt_inr(INCOME_CEILING)} eligibility ceiling.",
            f"Micro Finance offers a lower interest rate ({micro['interest_rate']}% p.a.) "
            f"compared to Aajeevika ({aajeevika['interest_rate']}% p.a.).",
        ]

        return _eligible(
            recommended=micro,
            alternative=aajeevika,
            reasons=reasons,
            rejected_schemes=rejected_schemes,
        )

    # ── Branch B: Larger project (cost > ₹1,40,000) ──────────────────────────

    # micro_finance, mahila_samridhi, and aajeevika rejected — project too large
    rejected_schemes.append({
        "scheme_id":        "micro_finance",
        "scheme_name":      micro["name"],
        "rejection_reason": (
            f"Project cost {_fmt_inr(cost)} exceeds the Micro Finance "
            f"limit of {_fmt_inr(micro_ceiling)}."
        ),
    })
    if mahila:
        rejected_schemes.append({
            "scheme_id":        "mahila_samridhi",
            "scheme_name":      mahila["name"],
            "rejection_reason": (
                f"Project cost {_fmt_inr(cost)} exceeds the Mahila Samridhi Yojana "
                f"limit of {_fmt_inr(mahila['max_project_cost'])}."
            ),
        })
    rejected_schemes.append({
        "scheme_id":        "aajeevika_microfinance",
        "scheme_name":      aajeevika["name"],
        "rejection_reason": (
            f"Project cost {_fmt_inr(cost)} exceeds the Aajeevika Micro-Finance "
            f"limit of {_fmt_inr(micro_ceiling)}."
        ),
    })

    # Check whether project cost fits within the Term Loan ceiling
    if cost > term_ceiling:
        return _ineligible(
            f"Project cost {_fmt_inr(cost)} exceeds the maximum supported "
            f"project cost of {_fmt_inr(term_ceiling)} across all business schemes."
        )

    # Check if activity qualifies for Green Business Scheme
    if green and _is_green_activity(activity):
        # Green Business recommended at 6.0% (vs Term Loan 8.0%)
        reasons = [
            f"Project cost of {_fmt_inr(cost)} qualifies for the Green Business Scheme "
            f"(up to {_fmt_inr(green['max_project_cost'])}).",
            f"Activity '{activity}' qualifies as an eco-friendly / green enterprise initiative.",
            f"Offers a concessional interest rate of {green['interest_rate']}% p.a. with extended tenure of {green['tenure_months']} months.",
            f"Annual income of {_fmt_inr(income)} is within the "
            f"{_fmt_inr(INCOME_CEILING)} eligibility ceiling.",
        ]

        if cost <= udyam_ceiling:
            alternative = udyam
            rejected_schemes.append({
                "scheme_id":        "term_loan",
                "scheme_name":      term["name"],
                "rejection_reason": (
                    f"Green Business Scheme offers a lower interest rate ({green['interest_rate']}% p.a.) "
                    f"compared to Term Loan ({term['interest_rate']}% p.a.) for eco activities."
                ),
            })
        else:
            alternative = term
            rejected_schemes.append({
                "scheme_id":        "udyam_nidhi",
                "scheme_name":      udyam["name"],
                "rejection_reason": (
                    f"Project cost {_fmt_inr(cost)} exceeds the Udyam Nidhi "
                    f"limit of {_fmt_inr(udyam_ceiling)}."
                ),
            })

        return _eligible(
            recommended=green,
            alternative=alternative,
            reasons=reasons,
            rejected_schemes=rejected_schemes,
        )

    # General business activity -> Term Loan is recommended
    if green:
        rejected_schemes.append({
            "scheme_id":        "green_business",
            "scheme_name":      green["name"],
            "rejection_reason": "Green Business Scheme requires eco-friendly, renewable energy, or green enterprise activities.",
        })

    reasons = [
        f"Project cost of {_fmt_inr(cost)} qualifies for the Term Loan Scheme "
        f"(up to {_fmt_inr(term_ceiling)}).",
        f"Business activity ({activity}) is supported under this scheme.",
        f"Annual income of {_fmt_inr(income)} is within the "
        f"{_fmt_inr(INCOME_CEILING)} eligibility ceiling.",
    ]

    # Udyam Nidhi as alternative only when the project cost fits its ceiling too
    if cost <= udyam_ceiling:
        alternative = udyam
    else:
        alternative = None
        # Udyam Nidhi rejected because project is too large for it
        rejected_schemes.append({
            "scheme_id":        "udyam_nidhi",
            "scheme_name":      udyam["name"],
            "rejection_reason": (
                f"Project cost {_fmt_inr(cost)} exceeds the Udyam Nidhi "
                f"limit of {_fmt_inr(udyam_ceiling)}."
            ),
        })

    return _eligible(
        recommended=term,
        alternative=alternative,
        reasons=reasons,
        rejected_schemes=rejected_schemes,
    )


# ─── Response builders ─────────────────────────────────────────────────────────

def _eligible(recommended, alternative, reasons, rejected_schemes):
    return {
        "eligible":             True,
        "recommended_scheme":   _scheme_as_dict(recommended),
        "alternative_scheme":   _scheme_as_dict(alternative) if alternative else None,
        "reasons":              reasons,
        "rejected_schemes":     rejected_schemes,
        "ineligibility_reason": None,
    }


def _ineligible(reason: str):
    return {
        "eligible":             False,
        "recommended_scheme":   None,
        "alternative_scheme":   None,
        "reasons":              [],
        "rejected_schemes":     [],
        "ineligibility_reason": reason,
    }
