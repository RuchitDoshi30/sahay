"""
recommender.py  —  Sahay SIH26092
Owner: Pair 1 / Ruchit

Deterministic scheme recommendation engine.

Given a frozen user profile (9 fields), this module decides:
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


# ─── Helpers ───────────────────────────────────────────────────────────────────

def _fmt_inr(amount: int) -> str:
    """Format an integer rupee amount as a readable Indian string, e.g. 380000 → ₹3,80,000."""
    # Use Python's locale-free manual formatting for portability.
    s = str(amount)
    # Insert commas: last 3 digits, then groups of 2 from the right
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


# ─── Main public function ──────────────────────────────────────────────────────

def recommend(profile: dict) -> dict:
    """
    Evaluate a user profile and return a recommendation result.

    Parameters
    ----------
    profile : dict
        Must contain all fields from ProfileRequest (9 fields).
        Caller (route) is responsible for schema validation before calling this.

    Returns
    -------
    dict  matching the shape of RecommendationResponse:
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

    rejected_schemes = []

    # ── Step 1: SC certificate check ──────────────────────────────────────────
    # Without a valid SC/ST certificate the applicant is not in the NSFDC target
    # group. No scheme can be recommended regardless of other inputs.

    if not has_sc:
        return _ineligible(
            "Applicant does not hold a valid SC/ST certificate. "
            "NSFDC schemes are available only to Scheduled Caste beneficiaries."
        )

    # ── Step 2: Income ceiling check ──────────────────────────────────────────
    # Annual family income must be at or below ₹5,00,000 (NSFDC policy ceiling).
    # Exactly ₹5,00,000 is accepted; ₹5,00,001 is not.

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
    return _recommend_business(schemes, income, cost, activity, rejected_schemes)


# ─── Education path ────────────────────────────────────────────────────────────

def _recommend_education(schemes, income, cost, activity, rejected_schemes):
    """
    Education journey: only educational_loan applies.
    Business schemes are always rejected for an education purpose.
    """

    edu = schemes["educational_loan"]

    # Reject all business schemes — wrong purpose
    for sid in ("micro_finance", "aajeevika_microfinance", "term_loan", "udyam_nidhi"):
        s = schemes[sid]
        rejected_schemes.append({
            "scheme_id":        sid,
            "scheme_name":      s["name"],
            "rejection_reason": "Purpose is 'education', not 'business'.",
        })

    # Check whether the project cost fits within the educational loan ceiling
    if cost > edu["max_project_cost"]:
        return _ineligible(
            f"Course cost {_fmt_inr(cost)} exceeds the Educational Loan ceiling "
            f"of {_fmt_inr(edu['max_project_cost'])}."
        )

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


# ─── Business path ─────────────────────────────────────────────────────────────

def _recommend_business(schemes, income, cost, activity, rejected_schemes):
    """
    Business journey: select scheme based on project_cost thresholds read
    directly from schemes.json (max_project_cost).

    Decision tree:
      cost ≤ micro_finance.max_project_cost  (₹1,40,000)
          → recommend micro_finance
          → alternative: aajeevika_microfinance

      cost > micro_finance.max_project_cost  AND  cost ≤ term_loan.max_project_cost  (₹50,00,000)
          → recommend term_loan
          → alternative: udyam_nidhi  (only if cost ≤ udyam_nidhi.max_project_cost = ₹5,00,000)

      cost > term_loan.max_project_cost
          → no suitable scheme

    Reject educational_loan because purpose is business.
    """

    micro     = schemes["micro_finance"]
    aajeevika = schemes["aajeevika_microfinance"]
    term      = schemes["term_loan"]
    udyam     = schemes["udyam_nidhi"]
    edu       = schemes["educational_loan"]

    micro_ceiling = micro["max_project_cost"]   # ₹1,40,000 from schemes.json
    term_ceiling  = term["max_project_cost"]    # ₹50,00,000 from schemes.json
    udyam_ceiling = udyam["max_project_cost"]   # ₹5,00,000 from schemes.json

    # Educational loan is always rejected for a business purpose
    rejected_schemes.append({
        "scheme_id":        "educational_loan",
        "scheme_name":      edu["name"],
        "rejection_reason": "Purpose is 'business', not 'education'.",
    })

    # ── Branch A: Small project (cost ≤ ₹1,40,000) ───────────────────────────
    if cost <= micro_ceiling:

        # term_loan and udyam_nidhi rejected — project too small / not the right fit
        rejected_schemes.append({
            "scheme_id":        "term_loan",
            "scheme_name":      term["name"],
            "rejection_reason": (
                f"Project cost {_fmt_inr(cost)} is within the Micro Finance range "
                f"(up to {_fmt_inr(micro_ceiling)}). Term Loan is for larger projects."
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

    # micro_finance and aajeevika rejected — project too large
    rejected_schemes.append({
        "scheme_id":        "micro_finance",
        "scheme_name":      micro["name"],
        "rejection_reason": (
            f"Project cost {_fmt_inr(cost)} exceeds the Micro Finance "
            f"limit of {_fmt_inr(micro_ceiling)}."
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

    # Term Loan is recommended
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
