# Architecture Decision Log (ADR) — SIH26092 Sahay

> **Repository Architecture & Policy Decision Log**  
> **Lead Architect & Backend Lead:** Ruchit  
> **Repository Branch:** `feature/backend-recommendation`  
> **Format:** Chronological reverse order (newest decisions at the top). Every architectural choice, rejected alternative, and compliance rationale is logged here.

---

## DL-008 — AI Architecture Guardrail: Strict Separation of NLP Interface and Deterministic Rule Engine

**Date:** 2026-09-12  
**Decision Maker:** Pair 1 (Ruchit — Lead Architect)  
**Status:** Accepted & Enforced

### Context:
Modern GenAI (LLMs) offers remarkable conversational interfaces. However, deploying probabilistic neural networks to evaluate public credit eligibility introduces catastrophic risks:
1. **Hallucination:** An LLM might promise a loan to an ineligible applicant or quote incorrect interest rates.
2. **Administrative Law & Article 14 Violation:** Government decisions affecting citizen welfare cannot be arbitrary or non-reproducible. Under the Right to Information (RTI) Act, 2005, every rejection must have an auditable, deterministic statutory basis.
3. **Non-Determinism:** The same citizen entering identical details on two consecutive days cannot receive different outcomes.

### Decision:
We enforce a strict, inviolable two-layer architectural boundary:
- **Layer 1 (Perception & Extraction - AI):** Voice agents (Bhashini), Document OCR (Docling), and conversational LLMs are permitted *exclusively* for unstructured-to-structured entity extraction (converting audio or free text into `ProfileRequest` JSON).
- **Layer 2 (Policy & Eligibility - Deterministic Code):** The recommendation engine (`recommender.py`) remains 100% deterministic Python logic. Zero LLM weights, zero probabilistic scoring, and zero random seeds are permitted in the eligibility cascade.

```
  CITIZEN (Speaks in Gujarati)
             │
             ▼
  ┌────────────────────────────────────────────────────────┐
  │ LAYER 1: AI PERCEPTION & TRANSLATION (Bhashini/NLU)     │
  │ • Converts audio to text                               │
  │ • Extracts: cost=380000, income=300000, purpose=dairy │
  │ • STRICT CONSTRAINT: Zero eligibility decision-making  │
  └──────────────────────────┬─────────────────────────────┘
                             │ Validated ProfileRequest JSON
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ LAYER 2: STATUTORY POLICY ENGINE (recommender.py)      │
  │ • 100% Deterministic Python Rule Evaluation            │
  │ • Mathematical boundaries (income <= 500000)          │
  │ • Generates RTI-compliant, auditable reason logs       │
  └────────────────────────────────────────────────────────┘
```

### Alternatives Rejected:
- *End-to-End LLM Agent:* Rejected due to uncontrollable hallucination and legal liability under Indian public credit mandates.
- *LLM with Few-Shot Prompting for Eligibility:* Rejected because prompt-based reasoning cannot guarantee 100% mathematical boundary precision across millions of requests.

---

## DL-007 — Transparent Data Lineage: Explicit Flagging of Prototype vs Live CBS Feeds

**Date:** 2026-09-12  
**Decision Maker:** Pair 1 (Ruchit) in alignment with SIH Evaluation Guidelines  
**Status:** Accepted

### Context:
The channel partner dataset (`partners.json`) includes operational metrics such as branch liquidity (`fund_available`) and recovery health (`no_overdues`). In the hackathon environment, real-time Core Banking Solution (CBS) APIs of State Channelising Agencies (e.g. GSCDC) are not publicly accessible without government Memorandum of Understanding (MoU).

### Decision:
To maintain absolute academic and professional integrity before the Ministry evaluation panel:
1. Every partner payload returned by `/api/partners` must explicitly contain `data_source: "prototype_mock"` and `prototype_status: "indicative_data"`.
2. The UI must clearly render an informative badge indicating that branch liquidity figures are illustrative prototype mocks awaiting Phase 4 CBS API hooks.

### Alternatives Rejected:
- *Silently displaying mock liquidity as real data:* Rejected as unethical and misleading to government stakeholders.

---

## DL-006 — India Stack & Digital Public Infrastructure (DPI) Alignment

**Date:** 2026-09-12  
**Decision Maker:** Pair 1 (Ruchit)  
**Status:** Accepted for Prototype 2 Roadmap

### Context:
Generic private fintech apps rely on proprietary credit bureaus (CIBIL, Experian) and third-party document scraping. Government social welfare systems operate within the India Stack ecosystem.

### Decision:
All future identity and financial verification hooks must prioritize open, sovereign Digital Public Infrastructure:
- **DigiLocker:** For W3C-compliant Verifiable Credentials of SC/ST Caste Certificates from State Revenue Departments.
- **Jan Samarth Platform:** Aligning scheme taxonomy with the Ministry of Finance's unified national credit gateway.
- **Bhashini:** Sovereign language translation mission for Indic multilingual voice support.
- **RBI PTPFC (Public Tech Platform for Frictionless Credit):** Direct consent-based fetching of agricultural and dairy cooperative cash-flow records.

---

## DL-005 — `sessionStorage` Chosen for Cross-Page Profile State Hydration

**Date:** 2026-09-12  
**Decision Maker:** Pair 2 (Frontend) in consultation with Pair 1  
**Status:** Accepted

### Decision:
Profile input data is stored in the browser's `sessionStorage` under the key `sahay_profile` upon submission on `/profile`. Subsequent pages (`/result`, `/partners`, `/summary`) hydrate from this storage to prevent redundant API re-submissions while preserving privacy upon browser tab closure.

### Alternatives Rejected:
- *Redux / Zustand:* Unnecessary bundle overhead for a streamlined 5-screen prototype.
- *URL Query Parameters:* Rejected due to exposure of sensitive personal income details in browser history and server access logs.
- *Persistent LocalStorage:* Rejected to ensure user data does not linger on shared/kiosk terminals in rural Common Service Centres (CSCs).

---

## DL-004 — Temporary String Bridge `SCHEME_ID_TO_SEARCH_TERM` in `/api/partners`

**Date:** 2026-09-12  
**Decision Maker:** Pair 1 (Backend) — Technical Debt Flagged for Pair 3  
**Status:** Temporary Bridge (Pending Pair 3 normalization)

### Decision:
`routes/partners.py` implements an intermediary dictionary mapping normalized scheme IDs (e.g., `"term_loan"`) to free-text search tokens (`"term loan"`):
```python
SCHEME_ID_TO_SEARCH_TERM = {
    "term_loan": "term loan",
    "micro_finance": "microfinance",
    "aajeevika_microfinance": "microfinance",
    "udyam_nidhi": "msme",
    "educational_loan": "education",
}
```

### Rationale & Pending Refactoring:
`partners.json` currently stores supported schemes as free-text descriptions (e.g., `"Term Loan & Agri Credit"`). To prevent breaking the system during initial integration, this dictionary bridges the gap. Pair 3 has been assigned the task of normalizing `partners.json` to store a structured list: `"supported_schemes": ["term_loan", "udyam_nidhi"]`.

---

## DL-003 — Program-Wide Income Ceiling (₹5,00,000) Codified as a Policy Constant

**Date:** 2026-09-12  
**Decision Maker:** Pair 1 (Ruchit)  
**Status:** Accepted

### Decision:
The NSFDC annual family income limit is defined as `INCOME_CEILING = 500_000` within `services/recommender.py`.

### Rationale:
The ₹5,00,000 ceiling is a program-wide statutory eligibility gate mandated by the Ministry of Social Justice and Empowerment across all NSFDC concessional loan schemes. Duplicating this ceiling inside each individual scheme entry in `schemes.json` would violate DRY (Don't Repeat Yourself) principles and create synchronization hazards during policy revisions.

### Boundary Semantics:
- `annual_income <= 500_000`: Eligible.
- `annual_income == 500_001`: Ineligible (Statutory rejection triggered).

---

## DL-002 — Dynamic Loading of Scheme Cost Ceilings from Configuration

**Date:** 2026-09-12  
**Decision Maker:** Pair 1 (Ruchit)  
**Status:** Accepted

### Decision:
Threshold limits for scheme categorization (`micro_finance.max_project_cost = 140000`, `term_loan.max_project_cost = 5000000`) are loaded dynamically from `backend/data/schemes.json` at runtime via `loaders.py` rather than hardcoded in Python logic.

### Rationale:
Decouples public policy parameters from engine code. When NSFDC issues administrative circulars modifying micro-credit brackets, updating the JSON configuration immediately updates engine behavior without requiring code refactoring or recompilation.

---

## DL-001 — In-Memory & Local JSON Architecture for Prototype 1

**Date:** Project Kickoff  
**Decision Maker:** Full Team  
**Status:** Accepted (Scope Freeze for Prototype 1)

### Decision:
Prototype 1 operates entirely with local JSON files (`schemes.json`, `partners.json`) loaded into memory on application startup. No relational database (PostgreSQL) or NoSQL store is provisioned in this phase.

### Rationale:
Ensures zero external operational dependencies, zero database credential configuration, lightning-fast boot times, and 100% reproducible test runs in local and offline hackathon presentation environments.
