# Data Dictionary & Schema Governance — SIH26092 Sahay

> **Canonical Data Dictionary & Schema Reference**  
> **Lead Architect & Backend Lead:** Ruchit  
> **Repository Branch:** `feature/backend-recommendation`  
> **Contract Status:** Frozen Core API Contract (v1.0) | Dynamic Extension Ready (v2.0 Draft)

---

## 1. Overview & Data Philosophy

The Sahay platform enforces strict, schema-driven data governance across the entire stack. Every data point ingested, processed, or emitted adheres to typed Pydantic v2 schemas. This eliminates runtime type ambiguity and ensures that public welfare decisions are 100% predictable, auditable, and conformant with Indian Digital Public Infrastructure (DPI) standards.

### Data Governance Tenets:
1. **Zero Field Renaming:** Field names documented in this specification are **frozen**. No frontend, backend, or partner service may rename keys without a formal version bump and team consensus.
2. **Statutory Verifiability:** Field semantics map directly to National Scheduled Castes Finance and Development Corporation (NSFDC) operational guidelines and Ministry of Social Justice and Empowerment (MoSJE) criteria.
3. **Data Honesty & Transparency:** All fields derived from prototype mocks (such as partner CBS liquidity) are explicitly flagged with provenance metadata (`data_source: "prototype"`) to prevent misleading evaluating authorities.

---

## 2. User Profile Request Fields (`POST /api/recommend`)

Validated via `ProfileRequest` in `backend/schemas/request_models.py`.

| Field Name | Data Type | Constraint | Required | Canonical Example | GovTech Definition & Validation Rules |
|---|---|---|:---:|---|---|
| `has_sc_certificate` | `boolean` | Strict boolean | ✓ | `true` | **Statutory Exclusion Gate:** Indicates whether applicant holds a certified Scheduled Caste certificate. Under NSFDC constitutional mandate, `false` results in immediate ineligibility. |
| `annual_income` | `integer` | `> 0` | ✓ | `300000` | **Statutory Income Ceiling:** Total gross annual family income in INR. Threshold is ₹5,00,000 (Double the Poverty Line criterion as revised by MoSJE). `income <= 500000` is accepted; `500001` triggers statutory rejection. |
| `purpose` | `string` | `"business"` \| `"education"` | ✓ | `"business"` | **Policy Routing Gate:** Primary objective of credit. Evaluated case-insensitively. Directs pipeline into commercial self-employment or technical/higher education. |
| `project_cost` | `integer` | `> 0` | ✓ | `380000` | **Scheme Sizing Parameter:** Total estimated capital expenditure for business unit or full course tuition fees in INR. Determines micro vs term loan categorization. |
| `activity_type` | `string` | Non-empty string | ✓ | `"dairy"` | **Activity Sub-sector:** Specific trade or academic specialization (e.g. `"dairy"`, `"kirana"`, `"tailoring"`, `"btech"`, `"nursing"`). Used for plain-language reasoning logs and partner specialization matching. |
| `state` | `string` | Valid Indian State | ✓ | `"Gujarat"` | **Jurisdictional Boundary:** State of residence. Maps applicant to the appropriate State Channelising Agency (SCA) territory (e.g., GSCDC in Gujarat). |
| `district` | `string` | Valid District | ✓ | `"Rajkot"` | **Administrative Unit:** District of proposed business or residence. Used for local bank/SCA branch filtering. |
| `latitude` | `float` | `-90.0` to `90.0` | ✗ | `22.3039` | **Geospatial Coordinate:** Applicant's GPS latitude. When provided alongside longitude, triggers Euclidean/Haversine distance ranking. |
| `longitude` | `float` | `-180.0` to `180.0` | ✗ | `70.8022` | **Geospatial Coordinate:** Applicant's GPS longitude. Optional; when omitted, partner search falls back to administrative district filtering. |

---

## 3. Scheme Policy Model (`schemes.json` & `SchemeInfo`)

Represents NSFDC credit schemes configured under `backend/data/schemes.json` and returned via `SchemeInfo` (`backend/schemas/recommendation_models.py`).

| Field Name | Data Type | Units | Example | Description & Statutory Policy Reference |
|---|---|---|---|---|
| `id` | `string` | Unique Slug | `"term_loan"` | Unique identifier. Master keys: `micro_finance`, `aajeevika_microfinance`, `term_loan`, `udyam_nidhi`, `educational_loan`. |
| `name` | `string` | Text | `"Term Loan Scheme"` | Official scheme nomenclature published by NSFDC. |
| `interest_rate` | `float` | % p.a. | `8.0` | Concessional annual interest rate charged to the end beneficiary. |
| `max_project_cost`| `integer` | INR | `5000000` | Upper limit of project capital cost permissible under the scheme. Micro-Finance: ₹1.4L; Udyam Nidhi: ₹5L; Educational Loan: ₹40L; Term Loan: ₹50L. |
| `loan_cap` | `integer` | INR | `4500000` | Maximum absolute loan quantum that can be sanctioned by NSFDC. |
| `loan_percentage` | `integer` | % | `90` | Percentage of total project cost funded by NSFDC/SCA. Remaining percentage is promoter's own contribution (margin money). |
| `tenure_months` | `integer` | Months | `60` | Maximum allowable repayment duration excluding moratorium. |
| `moratorium_months`| `integer` | Months | `6` | Repayment holiday after initial loan disbursement to allow project gestation and cash-flow generation. |
| `description` | `string` | Text | `"Provides term loans..."` | Summary of scheme objectives, eligible activities, and target beneficiaries. |

---

## 4. Recommendation Response Model (`POST /api/recommend`)

Validated via `RecommendationResponse` in `backend/schemas/recommendation_models.py`.

| Field Name | Data Type | Nullable | Example | GovTech Audit & Explainability Semantics |
|---|---|:---:|---|---|
| `eligible` | `boolean` | ✗ | `true` | Binary flag indicating whether applicant clears statutory baseline checks. |
| `recommended_scheme`| `SchemeInfo` | ✓ | `{ id: "term_loan", ... }` | Primary recommended scheme providing maximum coverage and optimal interest rate. `null` if ineligible. |
| `alternative_scheme`| `SchemeInfo` | ✓ | `{ id: "udyam_nidhi", ... }`| Fallback scheme ensuring "No Wrong Door" access if primary channel has backlog or quota limits. `null` if no secondary fit exists. |
| `reasons` | `list[string]` | ✗ | `["Project cost ₹3,80,000 matches..."]` | Plain-language, auditable justification for why the primary scheme was selected. |
| `rejected_schemes` | `list[RejectedScheme]`| ✗ | `[{...}]` | Array of schemes evaluated and eliminated, satisfying RTI explainability standards. |
| `ineligibility_reason`| `string` | ✓ | `"Annual income of ₹5,00,001 exceeds..."` | Explicit reason code explaining disqualification when `eligible` is `false`. |

### 4.1 Nested Schema: `RejectedScheme`
| Field Name | Data Type | Example | Description |
|---|---|---|---|
| `scheme_id` | `string` | `"micro_finance"` | Identifier of scheme ruled out during evaluation. |
| `scheme_name` | `string` | `"Micro Finance Scheme"` | Human-readable scheme name. |
| `rejection_reason` | `string` | `"Project cost ₹3,80,000 exceeds Micro Finance ceiling of ₹1,40,000"` | Deterministic, non-vague exclusion explanation. |

---

## 5. Loan Calculation Model (`POST /api/calculate`)

Validated via `CalculateRequest` and `CalculationResponse` in `backend/schemas/calculation_models.py`.

| Field Name | Data Type | Units | Example | Mathematical Formulation |
|---|---|---|---|---|
| `scheme_id` | `string` | Identifier | `"term_loan"` | Scheme against which loan amortization is evaluated. |
| `project_cost` | `integer` | INR | `380000` | Input project cost provided by user. |
| `possible_loan` | `integer` | INR | `342000` | `min(project_cost × loan_percentage / 100, loan_cap)` |
| `own_contribution`| `integer` | INR | `38000` | `project_cost - possible_loan` (Mandatory promoter margin money) |
| `loan_percentage` | `integer` | % | `90` | Concessional loan ratio. |
| `interest_rate` | `float` | % p.a. | `8.0` | Annual interest rate. |
| `tenure_months` | `integer` | Months | `60` | Post-moratorium amortization tenure. |
| `moratorium_months`| `integer` | Months | `6` | Grace period before monthly EMI servicing begins. |
| `monthly_estimate`| `integer` | INR | `6934` | Standard banking amortization formula: $\text{EMI} = P \times r \times \frac{(1+r)^n}{(1+r)^n - 1}$ where $r = \frac{\text{interest\_rate}}{12 \times 100}$. |
| `total_repayable` | `integer` | INR | `416040` | $\text{monthly\_estimate} \times \text{tenure\_months}$ |
| `note` | `string` | Text | `"EMI calculated after..."` | Statutory disclaimer clarifying that figures are indicative estimates. |

---

## 6. Channel Partner Directory Model (`GET /api/partners`)

### 6.1 Target Schema (`api-contract.md` Frozen Specification)
Pair 3's `partner_locator.py` and `partners.json` must align to these precise contract fields:

| Field Name | Data Type | Nullable | Example | GovTech Semantics |
|---|---|:---:|---|---|
| `id` | `string` | ✗ | `"GJ-RJK-001"` | Canonical partner identifier (State-District-Sequence). |
| `name` | `string` | ✗ | `"Gujarat Scheduled Castes Development Corp (GSCDC)"` | Official entity name registered with NSFDC. |
| `type` | `string` | ✓ | `"SCA"` | Entity classification: `"SCA"`, `"RRB"`, `"Nationalized Bank"`, or `"MFI"`. |
| `state` | `string` | ✗ | `"Gujarat"` | State jurisdiction. |
| `district` | `string` | ✗ | `"Rajkot"` | Administrative district. |
| `address` | `string` | ✓ | `"Opposite Collector Office, Rajkot"` | Physical office/branch address. |
| `supported_schemes`| `list[string]`| ✗ | `["term_loan", "udyam_nidhi"]` | Normalized scheme IDs officially channeled by this partner branch. |
| `fund_available` | `boolean` | ✗ | `true` | Branch lending liquidity flag under the requested scheme. |
| `no_overdues` | `boolean` | ✗ | `true` | Audit compliance flag: entity has no outstanding default with NSFDC. |
| `rank_score` | `float` | ✗ | `0.95` | Composite prioritization score (weighting distance, liquidity, and recovery). |
| `latitude` | `float` | ✓ | `22.3039` | Branch GPS latitude. |
| `longitude` | `float` | ✓ | `70.8022` | Branch GPS longitude. |
| `distance_km` | `float` | ✓ | `0.52` | Haversine distance from applicant coordinates. `null` if user coordinates omitted. |
| `data_source` | `string` | ✗ | `"prototype_mock"` | Data lineage provenance. Set to `"cbs_live"` in production. |
| `prototype_status`| `string` | ✗ | `"indicative_data"` | Disclaimer banner flag for evaluating jury. |

---

## 7. Future AI & Dynamic Data Dictionary (Stage 2 – Stage 5 Expansion)

These fields represent the planned schema extensions as Sahay transitions from static JSON to live Digital Public Infrastructure (DPI):

```
                                  V2.0 DYNAMIC EXTENSION
   ┌─────────────────────────────────────────────────────────────────────────────────┐
   │                               PROFILE EXTENSIONS                                │
   │  - digilocker_verified: bool       (Cryptographic caste cert check)             │
   │  - digilocker_doc_uri: string      (W3C Verifiable Credential URI)              │
   │  - voice_transcription_raw: string (Original audio transcript via Bhashini)     │
   │  - voice_confidence_score: float   (Confidence rating of extracted entities)    │
   ├─────────────────────────────────────────────────────────────────────────────────┤
   │                             LIVE PARTNER EXTENSIONS                             │
   │  - cbs_branch_ifsc: string         (Core Banking System branch identifier)      │
   │  - live_allocated_quota: int       (Current fiscal year uncommitted funds)       │
   │  - avg_sanction_tat_days: int      (Historical turnaround time in days)         │
   │  - ai_recommended_routing: bool    (Prioritized by ML capacity-aware engine)    │
   ├─────────────────────────────────────────────────────────────────────────────────┤
   │                         ALTERNATIVE CREDIT VIABILITY                            │
   │  - ptpfc_milk_pouring_ltr: float   (Dairy cooperative verified volume)          │
   │  - account_aggregator_surplus: int (Monthly median cash surplus via AA consent) │
   │  - udyam_registration_num: string  (Verified MSME registration number)          │
   └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. HTTP Status Codes & Error Structures

Every error returned by the Sahay API follows RFC 7807 problem details semantics encapsulated in Pydantic/FastAPI standard envelopes:

```json
{
  "detail": "Error message description"
}
```

| HTTP Status | Trigger Condition | Example Scenario |
|---|---|---|
| `200 OK` | Successful execution | Recommendation or calculation generated successfully. |
| `400 Bad Request` | Logical boundary error | Request violates functional business rules. |
| `404 Not Found` | Resource identifier missing | `scheme_id: "unknown_scheme"` submitted to `/api/calculate`. |
| `422 Unprocessable Entity` | Pydantic Schema Violation | `project_cost: -500`, missing required `purpose`, or malformed JSON. |
| `500 Internal Server Error` | Unhandled exception | Unexpected runtime defect (monitored and zero in current test suite). |
