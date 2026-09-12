# Sources, Statutory Authorities & Technical References — SIH26092 Sahay

> **Official Government Policy, Digital Public Infrastructure (DPI) Standards & Academic Citations**  
> **Lead Architect & Backend Lead:** Ruchit  
> **Repository Branch:** `feature/backend-recommendation`  
> **Evaluation Reference:** Smart India Hackathon (SIH) 2026 — Problem Statement SIH26092

---

## 1. Statutory Authorities & Legal Foundations

The eligibility criteria, affirmative action mandates, and credit channeling structures implemented in Sahay are grounded in the following statutory frameworks:

| Document / Authority | Legal & Policy Significance for Sahay |
|---|---|
| **Ministry of Social Justice and Empowerment (MoSJE), Government of India** | Apex administrative ministry governing social welfare corporations; issues target-group notifications, annual credit targets, and subsidy allocations. |
| **National Scheduled Castes Finance and Development Corporation (NSFDC)** | Central Public Sector Enterprise (CPSE) under Section 8 of the Companies Act, 2013. Operates as the apex financing institution for economic empowerment of Scheduled Castes living below double the poverty line. |
| **The Scheduled Castes and the Scheduled Tribes (Prevention of Atrocities) Act, 1989** | Provides the constitutional imperative and affirmative policy backdrop for economic rehabilitation, asset creation, and self-employment security for SC communities. |
| **MoSJE Office Memorandum on Income Eligibility Ceilings** | Established the official family income ceiling of **₹5,00,000 per annum** (expanding on the earlier Double Poverty Line formula), codified as `INCOME_CEILING = 500_000` in `backend/services/recommender.py`. |
| **Right to Information (RTI) Act, 2005** | Mandates full institutional transparency in public welfare decisions; served as the direct requirement for Sahay's deterministic reason logging and explicit `rejected_schemes` audit trail. |

---

## 2. Canonical NSFDC Scheme Policy Specifications

Parameters codified in `backend/data/schemes.json` are sourced from official NSFDC operational circulars and annual reports:

### 2.1 Term Loan Scheme (Direct Lending / Channeled)
- **Primary Objective:** Financing capital-intensive viable self-employment ventures in agriculture, manufacturing, services, and allied sectors.
- **Maximum Project Cost:** ₹50,00,000
- **NSFDC Loan Assistance:** Up to 90% (Maximum loan cap: ₹45,00,000)
- **Beneficiary Margin Money (Promoter Contribution):** Minimum 10%
- **Interest Rate:** 8.0% per annum
- **Repayment Tenure:** Up to 60 months (5 years)
- **Moratorium Period:** 6 months (Gestation period)
- **Source:** *NSFDC Operational Guidelines for Term Loan Assistance (Revised Edition 2023-24)*.

### 2.2 Micro Finance Scheme (Direct Lending to Individuals & SHGs)
- **Primary Objective:** Quick-disbursement micro-credit to small roadside vendors, artisans, cobblers, and vegetable sellers.
- **Maximum Project Cost:** ₹1,40,000
- **NSFDC Loan Assistance:** Up to 90% (Maximum loan cap: ₹1,25,000)
- **Promoter Contribution:** Minimum 10%
- **Interest Rate:** 5.0% per annum
- **Repayment Tenure:** Up to 36 months (3 years)
- **Moratorium Period:** 3 months
- **Source:** *NSFDC Micro-Credit Finance Guidelines (Circular No. NSFDC/MCF/2023)*.

### 2.3 Aajeevika Micro-Credit Scheme
- **Primary Objective:** Targeted alternative micro-credit channeled through Self Help Groups (SHGs) and State Channelising Agencies.
- **Maximum Project Cost:** ₹1,40,000
- **Maximum Loan Cap:** ₹1,25,000
- **Promoter Contribution:** 10%
- **Interest Rate:** 5.0% per annum
- **Repayment Tenure:** 36 months
- **Source:** *National Rural Livelihoods Mission (NRLM) & NSFDC Joint Livelihood Framework*.

### 2.4 Udyam Nidhi Scheme
- **Primary Objective:** Concessional credit for micro-enterprises and small service shops requiring intermediate capital expenditure.
- **Maximum Project Cost:** ₹5,00,000
- **NSFDC Loan Assistance:** Up to 90% (Maximum loan cap: ₹4,50,000)
- **Interest Rate:** 13.0% per annum
- **Repayment Tenure:** Up to 60 months
- **Moratorium Period:** 6 months
- **Source:** *NSFDC Udyam Nidhi Scheme Document (Official Circular 2022-23)*.

### 2.5 Educational Loan Scheme
- **Primary Objective:** Financial support to meritorious SC students pursuing accredited professional and technical higher education in India or abroad.
- **Maximum Project Cost (Tuition & Living):** Up to ₹40,00,000
- **NSFDC Loan Assistance:** Up to 90%
- **Interest Rate:** 6.5% per annum (with a 0.5% special interest rebate for female students)
- **Repayment Tenure:** Up to 120 months (10 years)
- **Moratorium Period:** Course duration + 6 months or getting a job (whichever is earlier)
- **Source:** *NSFDC Education Loan Circular (MoSJE Higher Education Window)*.

---

## 3. Channel Partner & Intermediary Delivery Architecture

NSFDC operates through accredited State Channelising Agencies (SCAs) and institutional partners rather than direct retail bank branches:

| Intermediary Tier | Typical Organization | Role in Sahay Architecture |
|---|---|---|
| **State Channelising Agency (SCA)** | Gujarat Scheduled Castes Development Corporation (GSCDC), Gandhinagar / Rajkot | Primary state-level nodal corporation executing tripartite agreements with NSFDC and state governments. |
| **Regional Rural Banks (RRBs)** | Saurashtra Gramin Bank, Baroda Gujarat Gramin Bank | Grassroots rural banking network providing last-mile disbursement and recovery. |
| **Public Sector Nationalized Banks** | State Bank of India, Bank of Baroda | Large-ticket term loan channeling under central credit guarantee schemes. |
| **Microfinance Institutions (MFIs)** | Accredited NBFC-MFIs | Last-mile micro-credit distribution to rural Joint Liability Groups (JLGs). |

> **Academic Honesty & Data Lineage Disclaimer:**  
> The partner records stored in `backend/data/partners.json` represent actual SCA and bank entities in Gujarat (e.g., GSCDC Rajkot District Office). However, operational liquidity metrics (`fund_available`) and overdue status (`no_overdues`) are **indicative prototype mocks**. In a live deployment, these values are populated in real-time via Core Banking System (CBS) API adapters.

---

## 4. Digital Public Infrastructure (DPI) & India Stack Integration References

The transition roadmap from static prototype to dynamic public platform relies on open sovereign APIs:

```
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                         INDIA STACK ECOSYSTEM                           │
  ├────────────────────────────────────┬────────────────────────────────────┤
  │ IDENTITY & ATTESTATION LAYER       │ FINANCIAL & CREDIT LAYER           │
  │ • DigiLocker / e-Pramaan (MeitY)   │ • Jan Samarth National Portal      │
  │ • Aadhaar Paperless Offline e-KYC  │ • RBI PTPFC (Frictionless Credit)  │
  ├────────────────────────────────────┼────────────────────────────────────┤
  │ INCLUSION & LINGUISTIC LAYER       │ SETTLEMENT & DISBURSEMENT LAYER    │
  │ • Bhashini (Indic Voice ASR & NLU) │ • Public Financial Mgmt Sys (PFMS) │
  │ • Open Maps (Survey of India / OSM)│ • NPCI Aadhaar Payments Bridge     │
  └────────────────────────────────────┴────────────────────────────────────┘
```

1. **Jan Samarth Portal (`jansamarth.in`):** Unified national portal under the Department of Financial Services (DFS), Ministry of Finance, linking 13 central credit-linked schemes across multiple ministries. Serves as our primary benchmark for scheme taxonomy and quota synchronization.
2. **DigiLocker API & e-Pramaan Framework (National e-Governance Division - NeGD, MeitY):** Standardized Verifiable Credentials (VC) specification for pulling digitally signed Caste Certificates directly from state revenue databases (e.g. Digital Gujarat portal), eliminating document forgery.
3. **Bhashini — National Language Translation Mission (MeitY):** Open APIs for Automatic Speech Recognition (ASR) and Machine Translation (MT) across 22 scheduled Indian languages, enabling illiterate rural citizens to interact via voice in native dialects.
4. **Public Tech Platform for Frictionless Credit (PTPFC — Reserve Bank Innovation Hub):** Consent-based digital aggregation of land records, milk pouring data from cooperative societies (AMUL, NDDB), and electricity consumption to provide cash-flow underwriting for informal nano-entrepreneurs.
5. **Account Aggregator (AA) Ecosystem (RBI / Sahamati):** Financial data-sharing architecture enabling citizens to securely share bank statements without physical branch visits.

---

## 5. Mathematical & Algorithmic Foundations

### 5.1 Loan Amortization Formula
Monthly EMI computation implemented in `backend/services/calculator.py` uses the standard reducing-balance amortization equation established by the Reserve Bank of India:

$$\text{EMI} = P \times r \times \frac{(1 + r)^n}{(1 + r)^n - 1}$$

Where:
- $P$ = Principal Loan Amount $= \min(\text{project\_cost} \times \frac{\text{loan\_percentage}}{100}, \text{loan\_cap})$
- $r$ = Monthly interest rate $= \frac{\text{annual\_interest\_rate}}{12 \times 100}$
- $n$ = Repayment tenure in months (evaluated strictly post-moratorium)

### 5.2 Haversine Great-Circle Distance Metric
The distance calculation utilized for geospatial ranking in `backend/services/partner_locator.py` is derived from spherical trigonometry:

$$d = 2R \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)} \right)$$

Where $R = 6371.0\text{ km}$ (mean radius of the Earth), $\phi$ represents latitude in radians, and $\lambda$ represents longitude in radians.

---

## 6. Software Engineering & Technical Specifications

| Framework / Tool | Reference URL | Standard / Spec Followed |
|---|---|---|
| **FastAPI 0.110+** | `https://fastapi.tiangolo.com` | ASGI asynchronous Python web framework conforming to OpenAPI 3.1 & JSON Schema. |
| **Pydantic v2** | `https://docs.pydantic.dev` | Core validation engine utilizing Rust-based type validation and schema generation. |
| **Pytest 8.0+** | `https://docs.pytest.org` | Standard test runner executing 60 deterministic automated test cases. |
| **React 19 + Vite** | `https://react.dev`, `https://vitejs.dev` | Modern frontend component architecture and ESM bundler. |
| **Leaflet & React-Leaflet** | `https://react-leaflet.js.org` | Mobile-friendly interactive map engine utilizing OpenStreetMap (ODbL) tiles. |
| **RFC 7807** | `https://tools.ietf.org/html/rfc7807` | Problem Details for HTTP APIs error response standard. |

---

## 7. Internal Project Blueprint Documents

This implementation directly fulfills the milestones and specifications documented in the internal project governance blueprints:
- `docs/SIH26092_Document_1_Project_Clarity.pdf` — Target group definition, problem scope, and persona mapping.
- `docs/SIH26092_Document_2_Technical_Blueprint.pdf` — Service decomposition, entity relationships, and API contract.
- `docs/SIH26092_Document_3_Checkpoint_Plan.pdf` — Pair programming allocation, quality gates, and demonstration roadmap.
