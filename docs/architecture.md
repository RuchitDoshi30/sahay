# Architecture & Technical Blueprint — SIH26092 Sahay

> **"No Wrong Door"** — Digital Public Infrastructure (DPI) aligned scheme guidance and eligibility gateway for National Scheduled Castes Finance and Development Corporation (NSFDC) beneficiaries under the Ministry of Social Justice and Empowerment (MoSJE), Government of India.
>
> **Lead Architect & Backend Lead:** Ruchit  
> **Repository Branch:** `feature/backend-recommendation`  
> **Status:** Prototype 1 Implemented & Verified (60/60 Tests Passing) | Prototype 2 & AI Roadmap Designed

---

## 1. Executive Summary & GovTech Problem Statement

In the existing welfare delivery landscape, Scheduled Caste (SC) entrepreneurs and students face a fragmented, high-friction ecosystem when seeking concessional credit. While the Government of India provides targeted credit through the National Scheduled Castes Finance and Development Corporation (NSFDC) and its network of State Channelising Agencies (SCAs), Regional Rural Banks (RRBs), and Nationalized Banks, beneficiaries suffer from:
1. **Information Asymmetry:** Lack of clarity on statutory income ceilings (₹5,00,000 p.a.), loan caps, interest subventions, and moratorium terms.
2. **"Wrong Door" Rejection:** Applicants approach bank branches for schemes they do not qualify for (e.g., requesting ₹3.8L under Micro Finance whose ceiling is ₹1.4L), face outright rejection, and abandon their entrepreneurial journey without being redirected to viable alternatives like the Term Loan Scheme or Udyam Nidhi.
3. **Disbursement Bottlenecks:** Physical branch visits to channel partners whose scheme-specific credit quotas are exhausted or who do not service that specific activity type.

**Sahay solves this by institutionalizing a zero-dead-end, deterministic "No Wrong Door" architecture.**

```
                                SAHAY ECOSYSTEM
   ┌────────────────────────────────────────────────────────────────────────┐
   │                        CITIZEN TOUCHPOINTS                             │
   │   [Web Portal (React)]   [Bhashini Voice AI (P2)]   [UMANG/CSC (P3)]   │
   └───────────────────────────────────┬────────────────────────────────────┘
                                       │ HTTP / JSON API
                                       ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                       SAHAY CORE API GATEWAY                           │
   │               (FastAPI / Pydantic v2 / Python 3.12)                    │
   │                                                                        │
   │  ┌───────────────────────┐ ┌───────────────────┐ ┌───────────────────┐ │
   │  │  POST /api/recommend  │ │ POST /api/calculate│ │ GET /api/partners │ │
   │  │  (Recommender Engine) │ │ (Loan Calculator) │ │ (Partner Locator) │ │
   │  └──────────┬────────────┘ └─────────┬─────────┘ └─────────┬─────────┘ │
   └─────────────┼────────────────────────┼─────────────────────┼───────────┘
                 │                        │                     │
                 ▼                        ▼                     ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                      DATA & AUDIT LAYER (CURRENT)                      │
   │  schemes.json (Frozen Rules)             partners.json (Geocoded SCA)  │
   │  - 100% Deterministic Policy Logic       - Lat/Long Coordinate Match   │
   │  - Zero Hallucination, RTI-Compliant      - Distance Ranking (Haversine)│
   └────────────────────────────────────────────────────────────────────────┘
                 │                                              │
                 │ ── FUTURE DYNAMIC MIGRATION (AI & DPI) ───    │
                 ▼                                              ▼
   ┌────────────────────────────────────────────────────────────────────────┐
   │                      FUTURE DYNAMIC INFRASTRUCTURE                     │
   │  - Docling/LLM Automated Policy Ingestion from MoSJE Gazette Circulars │
   │  - DigiLocker Verifiable Credential API (Instant SC Cert Verification)  │
   │  - Jan Samarth & RBI PTPFC Core Banking System (CBS) Live Quota Sync   │
   │  - Bhashini Multilingual Speech-to-Text & Dialect Normalization        │
   │  - ML Capacity-Aware Partner Routing (Turnaround Time Optimization)    │
   └────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core GovTech Architectural Principles

Unlike commercial private fintech aggregators (e.g., Paisabazaar, BankBazaar) that optimize for lead generation, CIBIL 750+ conversion, and commercial lender commissions, government welfare delivery requires fundamentally different design tenets:

| Dimension | Commercial Private Fintech | Government Scheme Platform (Sahay) |
|---|---|---|
| **Eligibility Philosophy** | Profitability & default risk optimization; rejects non-prime applicants immediately. | **Affirmative inclusion & "No Wrong Door"**: Must evaluate alternatives before ruling out assistance. |
| **Decision Mechanism** | Black-box credit scoring models (proprietary neural nets / tree ensembles). | **Deterministic rule execution**: Every decision must be traceable to gazette rules and legal circulars. |
| **Legal Auditability** | Proprietary trade secret; not legally contestable under public law. | **RTI (Right to Information) & Article 14 compliant**: Must supply explicit, statutory rejection reasons. |
| **Identity & Caste Trust** | Third-party credit bureau pull + manual document collection. | **DPI Integration**: Cryptographic verification via DigiLocker / e-Pramaan without physical cert tampering. |
| **Target Demographic** | Urban, digitally literate, formal salaried / GST-registered businesses. | Rural nano-entrepreneurs, dairy farmers, artisans, first-generation learners. |
| **Channel Network** | Commercial private banks, NBFCs, fintech loan apps. | State Channelising Agencies (SCAs), Regional Rural Banks (RRBs), Nationalized Banks, MFIs. |

---

## 3. Implemented Architecture (Repository State: Phase 1)

### 3.1 Backend Service Layer (`/backend`)
The backend is built as a high-performance, asynchronous REST API using **FastAPI** and **Pydantic v2**, strictly separating transport, schema validation, and domain logic:

```
backend/
├── app.py                          # FastAPI application factory, CORS, router mounting
├── requirements.txt                # fastapi, uvicorn, pydantic, pytest
│
├── routes/
│   ├── recommend.py                # POST /api/recommend (Pair 1 — Ruchit) [COMPLETED]
│   ├── calculate.py                # POST /api/calculate (Pair 1 — Jeet) [COMPLETED]
│   └── partners.py                 # GET  /api/partners (Pair 1 + Pair 3) [COMPLETED]
│
├── services/
│   ├── recommender.py              # Pure deterministic rule engine (Pair 1 — Ruchit) [COMPLETED]
│   ├── calculator.py               # Standard amortization & subsidy logic (Pair 1 — Jeet) [COMPLETED]
│   └── partner_locator.py          # Geo-filtering & partner ranking (Pair 3 — Jaymin) [NEEDS ALIGNMENT]
│
├── schemas/
│   ├── request_models.py           # ProfileRequest (9 fields, strict bounds) (Ruchit) [COMPLETED]
│   ├── recommendation_models.py    # RecommendationResponse, SchemeInfo, RejectedScheme (Ruchit) [COMPLETED]
│   ├── calculation_models.py       # CalculateRequest, CalculationResponse (Jeet) [COMPLETED]
│   └── partner_models.py           # PartnerResult, PartnersResponse [COMPLETED]
│
├── data/
│   ├── schemes.json                # 5 NSFDC canonical schemes + eligibility configs [COMPLETED]
│   └── partners.json               # Channel partner directory (SCA/RRB/MFI) [COMPLETED]
│
├── utils/
│   ├── loaders.py                  # JSON loaders, safe caching, scheme lookup [COMPLETED]
│   ├── distance.py                 # Haversine distance calculator [PENDING STUB]
│   └── validators.py               # Auxiliary validators [PENDING STUB]
│
├── tests/
│   ├── test_recommender.py         # 34 pytest unit tests for recommender (Ruchit) [PASSING]
│   ├── test_routes.py              # 26 pytest HTTP route & edge tests (Ruchit) [PASSING]
│   ├── test_calculator.py          # 3 pytest calculation verification tests (Jeet) [PASSING]
│   └── test_partner_locator.py     # Partner locator tests (Pair 3) [EMPTY — PENDING]
│
└── examples/
    ├── request_rk_dairy.json       # Rajkot dairy canonical request [COMPLETED]
    ├── recommendation_response.json# Canonical recommendation output [COMPLETED]
    ├── calculation_response.json   # Canonical calculation output [COMPLETED]
    └── partners_response.json      # Partner response example [EMPTY — PENDING]
```

### 3.2 Implemented Logic: The Recommender Engine (`services/recommender.py`)
Authored by **Ruchit**, the engine executes a three-tier deterministic decision cascade:
1. **Tier 1 — Statutory Exclusion Gates:**
   - `has_sc_certificate == False`: Immediate disqualification. The constitution of NSFDC restricts lending exclusively to Scheduled Castes.
   - `annual_income > 500_000`: Program-wide ceiling disqualification. Exceeding ₹5,00,000 family income renders the applicant ineligible under NSFDC criteria (Double the Poverty Line criterion updated by MoSJE).
2. **Tier 2 — Purpose & Domain Routing:**
   - Case-insensitive routing into `"business"` vs `"education"` branches.
   - For `purpose == "education"`: Evaluates against `educational_loan` (max project cost ₹40,00,000, 90% loan, 6.5% interest rate).
   - For `purpose == "business"`: Segregates into Micro-Finance bracket (`project_cost <= 1,40,000`) vs Term Loan bracket (`1,40,000 < project_cost <= 50,00,000`).
3. **Tier 3 — Scheme Prioritization & Transparent Rejection Reason Logging:**
   - Generates primary `recommended_scheme` and secondary `alternative_scheme`.
   - Populates `reasons`: Dynamic plain-language strings detailing exact thresholds matched.
   - Populates `rejected_schemes`: Explicit list of ruled-out schemes with deterministic, non-vague reasons (e.g., `"Project cost ₹3,80,000 exceeds the Micro Finance limit of ₹1,40,000"`).

### 3.3 Verification Metrics
- Total automated backend tests: **60 passing** (0 failures, 0 warnings).
- Recommender tests: **34** tests covering boundary conditions (₹5,00,000 vs ₹5,00,001 income; ₹1,40,000 vs ₹1,40,001 cost; invalid purposes; missing certs).
- Route integration tests: **26** tests covering HTTP status codes (200, 404, 422), Pydantic input coercion, CORS headers, and payload schemas.

---

## 4. Current Gaps & Work to Complete

While Pair 1 backend core logic is fully implemented and tested, the following components remain to be completed across the repository:

| Component | Responsible Pair | Current State | Work Remaining |
|---|---|---|---|
| **Partner Locator Service** | Pair 3 (Jaymin + Anjali) | `partner_locator.py` uses legacy Title-Case keys (`"Partner_Name"`, `"Office_Address"`). | Must align with `api-contract.md` field names (`id`, `name`, `type`, `supported_schemes`, `fund_available`, `no_overdues`, `rank_score`). |
| **Partner Locator Tests** | Pair 3 (Jaymin + Anjali) | `test_partner_locator.py` is empty (0 lines). | Must write comprehensive unit tests covering geo-filtering, distance sorting, and scheme compatibility. |
| **Utility Modules** | Pair 3 / Shared | `utils/distance.py` and `utils/validators.py` are empty stubs. | Move Haversine implementation from service into `utils/distance.py`. |
| **Example Payloads** | Pair 3 | `examples/partners_response.json` is empty. | Populate with canonical Rajkot partner response fixture matching contract. |
| **Frontend Result Page** | Pair 2 (Rudra + Bhagyashree) | `Result.jsx` contains placeholder markup. | Connect to `/api/recommend` and `/api/calculate`, displaying reasons, alternative scheme, and EMI estimates. |
| **Frontend Summary Page** | Pair 2 (Rudra + Bhagyashree) | `Summary.jsx` contains static layout. | Hydrate applicant profile, recommended scheme, loan breakdown, and selected channel partner from `sessionStorage`. |

---

## 5. Transition Roadmap: From Static Data to Dynamic AI-Augmented System

A central innovation in Sahay's architecture is its phased evolution: **Prototype 1 is deliberately deterministic on static JSON to prove zero-hallucination policy compliance. Subsequent phases introduce AI and live dynamic APIs without breaking the frozen contract.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FIVE-STAGE EVOLUTION ROADMAP                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ STAGE 1 (Current Prototype)                                                 │
│ • Local static schemes.json + partners.json                                 │
│ • 100% deterministic Python rules, 60 passing tests                         │
│ • Zero hallucination, instantaneous response, zero network latency          │
├─────────────────────────────────────────────────────────────────────────────┤
│ STAGE 2: Automated Policy Parsing & Dynamic Rule Ingestion                  │
│ • AI Ingestion Pipeline (Docling / LayoutLM / Multimodal LLM)               │
│ • Scrapes & extracts revised MoSJE / NSFDC circulars into candidate JSON    │
│ • Human-in-the-loop Gov Admin Portal for cryptographic sign-off & versioning│
├─────────────────────────────────────────────────────────────────────────────┤
│ STAGE 3: Bhashini Voice AI & Rural Accessibility Interface                  │
│ • Multilingual voice bot supporting 22 Indian scheduled languages           │
│ • Speech-to-Text (ASR) + NLU extracts 9 profile entities from spoken audio │
│ • Entity values fed to deterministic engine (Zero AI eligibility risk)      │
├─────────────────────────────────────────────────────────────────────────────┤
│ STAGE 4: Digital Public Infrastructure (DPI) & Live CBS Ingestion           │
│ • DigiLocker API: Instant cryptographically verifiable caste certificates   │
│ • Jan Samarth & RBI PTPFC Core Banking System (CBS) APIs                    │
│ • Live branch fund availability (`fund_available`) & quota sync             │
├─────────────────────────────────────────────────────────────────────────────┤
│ STAGE 5: Predictive Routing & Alternative Credit Viability                  │
│ • Account Aggregator (AA) cash-flow assessment for informal entrepreneurs    │
│ • ML-based Partner Capacity & Turnaround Time (TAT) routing                 │
│ • Adaptive scheme bundling (Skill Development + Concessional Credit)        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Stage 1 (Current): Deterministic Rule Engine on Curated Static Data
- **Mechanism:** Hard rules codified in Python, driven by `schemes.json` configuration.
- **Why it matters:** Government evaluators demand absolute proof that rules cannot be hallucinated. If an applicant has ₹5,00,001 income, they must be rejected with 100.0% certainty.

### Stage 2: AI-Powered Policy & Circular Ingestion Pipeline
- **Problem:** Government schemes update limits (e.g., expanding Micro Finance from ₹1.00L to ₹1.40L, or introducing special interest subventions for women under Mahila Samriddhi Yojana) via PDF circulars published on `nsfdc.nic.in`. Manual code updates introduce lag and human error.
- **AI Solution:** 
  1. An asynchronous ingestion pipeline monitors MoSJE and NSFDC gazette portals.
  2. Document Parsing AI (Docling / Optical Character Recognition + Layout-aware LLM) parses complex tables, interest tiers, and eligibility criteria from scanned government PDFs.
  3. Transforms unstructured text into candidate `schemes.json` schema diffs.
  4. **Human-in-the-Loop Verification:** A designated NSFDC administrative nodal officer reviews the diff in an administrative dashboard, clicks "Approve & Sign", and the engine dynamically updates its policy cache without server restart.

### Stage 3: Bhashini AI Multilingual Voice Interface
- **Problem:** The target demographic (rural artisans, sanitation workers, small dairy farmers) often have limited literacy in English or formal administrative Hindi, making multi-field web forms an insurmountable barrier.
- **AI Solution:**
  1. Integration with **Bhashini (National Language Translation Mission)** API.
  2. The applicant speaks in their local dialect (e.g., Kathiawadi Gujarati, Bhojpuri, Marathi): *"Mane doodh na vyapar mate char lakh ni zaroorat che"* (I need four lakhs for dairy business).
  3. Bhashini ASR converts voice to text; an Indic NLP entity extractor extracts:
     - `purpose`: `"business"`
     - `activity_type`: `"dairy"`
     - `project_cost`: `400000`
  4. The extracted JSON payload is piped directly into `/api/recommend`.
  5. **Architectural Guardrail:** The LLM *never* decides eligibility. It acts exclusively as a human-to-API linguistic bridge. The deterministic engine retains exclusive control over eligibility decisions.

### Stage 4: Live Data Feeds via India Stack (DPI)
- **DigiLocker Integration:** Beneficiary enters Aadhaar / DigiLocker consent; Sahay calls the e-Pramaan / State Revenue Department API to verify the SC Certificate XML/PDF signature directly, eliminating self-declaration fraud.
- **Jan Samarth Portal & CBS Webhooks:** Channel partner records in `partners.json` currently use static boolean flags for `fund_available`. In Stage 4, Sahay connects to bank Core Banking Solution (CBS) APIs and the Jan Samarth central loan portal via secure message queues (Apache Kafka / Celery + Redis), querying daily drawing power and remaining fiscal year SC-quota allocations at the IFSC branch code level.
- **RBI Public Tech Platform for Frictionless Credit (PTPFC):** Consent-based digital fetching of milk pouring records from dairy cooperatives (AMUL / NDDB), electricity bills, and land records to calculate accurate repayment capacity for borrowers without traditional CIBIL scores.

### Stage 5: Intelligent Partner Capacity-Aware Routing
- **Problem:** Even if a partner supports Term Loans in Rajkot, one branch might have a 45-day processing backlog, while another branch has an active credit desk with a 5-day average turnaround time (TAT).
- **AI Solution:** Machine learning models (Gradient Boosted Decision Trees) trained on historical partner sanction velocity, seasonal fund burn rates, and document rejection rates dynamically rank channel partners in `/api/partners`. The user is routed to the partner with the highest probability of swift sanction.

---

## 6. Security, Compliance, and Data Governance

1. **Constitutional & Legal Alignment:**
   - Strict compliance with the Scheduled Castes and the Scheduled Tribes (Prevention of Atrocities) Act, 1989, and NSFDC lending mandates.
   - Zero storage of personally identifiable information (PII) on disk in Prototype 1. In Phase 2, any Aadhaar data handled will use Aadhaar Data Vault (ADV) with tokenization conforming to UIDAI guidelines.
2. **Right to Information (RTI) Auditability:**
   - Every response payload returns full attribution: why the scheme was selected, which schemes were rejected, and the exact policy clause invoked.
3. **Data Integrity & Immutability:**
   - All financial numbers use standard decimal/integer arithmetic without floating-point precision loss.
   - Boundary checks are tested with automated property-based test cases.
