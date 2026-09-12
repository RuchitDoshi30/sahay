# Official Demonstration Script — SIH26092 Sahay

> **"No Wrong Door" Scheme Guidance & Channel Partner Gateway**  
> **Prepared for:** Ministry of Social Justice and Empowerment (MoSJE) & SIH Evaluation Jury  
> **Lead Presenter & Technical Lead:** Ruchit  
> **Repository Branch:** `feature/backend-recommendation`  
> **Target Duration:** 8 to 10 minutes (Presentation + Technical Q&A)

---

## 1. Pre-Flight Setup & Health Checklist

Execute these checks 5 minutes prior to jury arrival:

- [ ] **Automated Test Suite:** Run `cd backend && python -m pytest tests/ -v`  
  *Verification:* Ensure all **60 tests pass** with 0 failures and 0 warnings.
- [ ] **Backend Service:** Ensure Uvicorn is active on port `8000`:  
  `cd backend && uvicorn app:app --reload`
- [ ] **Frontend Application:** Ensure Vite is running on port `5173`:  
  `cd frontend && npm run dev`
- [ ] **Browser Tabs Ready:**
  1. Tab 1: `http://localhost:5173/` (Sahay Citizen Web App)
  2. Tab 2: `http://localhost:8000/docs` (Interactive FastAPI Swagger UI for technical inspection)
  3. Tab 3: Terminal window showing passing test output.

---

## 2. Demonstration Persona: Ramesh from Rajkot

| Attribute | Value | Narrative Significance |
|---|---|---|
| **Name** | Ramesh Parmar | Representative rural SC entrepreneur. |
| **Location** | Rajkot District, Gujarat | High-density dairy and animal husbandry hub. |
| **Social Category** | Scheduled Caste (holds certificate) | Qualifies under NSFDC statutory mandate. |
| **Annual Family Income** | ₹3,00,000 | Well within the statutory ₹5,00,000 ceiling. |
| **Loan Purpose** | Business (`"business"`) | Self-employment expansion. |
| **Activity Type** | Dairy Farming (`"dairy"`) | Priority allied agricultural activity under NSFDC. |
| **Estimated Project Cost**| ₹3,80,000 | Exceeds Micro Finance (₹1.4L), perfectly fits Term Loan. |

---

## 3. Step-by-Step Jury Demonstration

### Step 1: The "No Wrong Door" Mission (Home Page)
**URL:** `http://localhost:5173/`  
**Presenter Action:** Display the landing page hero section.

**Spoken Dialogue:**
> *"Respected Jury Members, across India, thousands of eligible Scheduled Caste citizens walk into local bank branches asking for government loans, only to be turned away because they applied under the wrong scheme or approached a branch that does not channel that specific facility. They leave empty-handed, confused, and disillusioned.*
>
> *Today, we present **Sahay** — an implementation of the Government's 'No Wrong Door' philosophy for the National Scheduled Castes Finance and Development Corporation (NSFDC). Sahay ensures that no applicant ever encounters a dead end. In under two minutes, an applicant receives a deterministic, auditable scheme recommendation, an indicative financial repayment schedule, and direct navigation to their nearest servicing State Channelising Agency."*

**Action:** Click **"Find My Scheme"** button to transition to `/profile`.

---

### Step 2: Citizen Profile Intake (Profile Page)
**URL:** `http://localhost:5173/profile`  
**Presenter Action:** Populate the 9 statutory input fields.

**Input Values to Enter:**
- **SC/ST Certificate:** Select `Yes`
- **Annual Family Income:** `300000`
- **Loan Purpose:** Select `Business`
- **Project Cost:** `380000`
- **Activity Type:** `Dairy`
- **State:** `Gujarat`
- **District:** `Rajkot`

**Spoken Dialogue:**
> *"Notice that we do not overwhelm the citizen with a 30-field banking form. We collect only the 9 statutory parameters required by NSFDC guidelines. Every single field is validated in real-time by our backend schemas built on Pydantic v2."*

**Action:** Click **"Find My Scheme"** / **"Continue"**.

---

### Step 3: Statutory Recommendation & Financial Estimation (Result Page)
**URL:** `http://localhost:5173/result`  
**Presenter Action:** Walk through the four distinct quarters of the result screen.

**Spoken Dialogue:**
> *"The backend has evaluated Ramesh's profile through our three-tier deterministic rule engine.
> 
> Look at the transparency of this result:*
> 
> 1. **Primary Recommendation:** The system recommends the **Term Loan Scheme**. Why? Because Ramesh's project cost of ₹3,80,000 exceeds the Micro Finance limit of ₹1,40,000, and dairy is an eligible business activity.
> 2. **Right to Information (RTI) Transparency:** Under 'Other Schemes Evaluated', the system clearly explains why Micro Finance was ruled out: *'Project cost of ₹3,80,000 exceeds the Micro Finance ceiling of ₹1,40,000'*. There is zero black-box ambiguity.
> 3. **The 'No Wrong Door' Alternative:** The engine automatically surfaces **Udyam Nidhi** as a secondary option, so if one channel experiences processing delays, Ramesh has an immediate alternative.
> 4. **Financial Breakdown:** Under NSFDC's 90% financing rule, Ramesh qualifies for a loan of ₹3,42,000 with a promoter contribution of just ₹38,000. At an 8% annual concessional interest rate over a 5-year tenure with a 6-month gestation moratorium, his monthly EMI is an affordable ₹6,934."*

**Action:** Click **"Locate Nearest Partners"** to transition to `/partners`.

---

### Step 4: Geospatial Channel Partner Discovery (Partners Page)
**URL:** `http://localhost:5173/partners`  
**Presenter Action:** Display the Leaflet OpenStreetMap view centered on Rajkot.

**Spoken Dialogue:**
> *"Knowing the scheme is only half the battle; knowing where to submit the application is what completes the journey.
>
> Here, the system filters all accredited channel partners in Gujarat, isolates those operating in Rajkot who specifically support the Term Loan Scheme, and ranks them by distance.
>
> The top result is the **Gujarat Scheduled Castes Development Corporation (GSCDC)** office in Rajkot, located just 0.5 km away. 
>
> *(Note for the Jury)*: In accordance with academic honesty guidelines, our partner directory clearly flags that branch liquidity metrics are currently prototype mocks, designed to hook directly into Core Banking Systems in Phase 4."*

**Action:** Select the GSCDC partner card and click **"Review Final Summary"**.

---

### Step 5: Consolidated Citizen Action Plan (Summary Page)
**URL:** `http://localhost:5173/summary`  
**Presenter Action:** Display the integrated summary card.

**Spoken Dialogue:**
> *"Here is the complete 'No Wrong Door' outcome. Ramesh can download or print this consolidated sheet, complete with his scheme entitlement, margin money requirement, repayment schedule, and the exact address of the GSCDC officer to meet. He is empowered, informed, and completely protected from middlemen."*

---

## 4. Technical Jury Deep-Dive & Live Boundary Testing

When technical evaluators ask to see code or API mechanics, transition immediately to `http://localhost:8000/docs`:

### Test 1: Statutory Income Boundary Enforcement
- Execute `POST /api/recommend` with `"annual_income": 500000`  
  *Result:* `eligible: true` (Inclusive statutory ceiling).
- Change to `"annual_income": 500001`  
  *Result:* `eligible: false`, `ineligibility_reason: "Annual family income of ₹5,00,001 exceeds statutory ceiling of ₹5,00,000"`.
- **Key Takeaway:** Mathematical boundary precision is hardcoded and fully covered by our test suite.

### Test 2: Project Cost Crossover
- Execute with `"project_cost": 140000` → Returns `micro_finance`.
- Change to `"project_cost": 140001` → Instantly shifts to `term_loan`.

---

## 5. Strategic Jury Q&A Reference

| Potential Question | Technical & Policy Answer |
|---|---|
| **"Why didn't you use an LLM or ChatGPT to pick the scheme?"** | Under Indian administrative law and Article 14 of the Constitution, public welfare eligibility must be deterministic, reproducible, and legally auditable. An LLM can hallucinate or give different answers to different citizens. In Sahay, AI is strictly reserved for the speech/NLP interface (Bhashini) and policy circular ingestion (Docling), while eligibility is 100% deterministic code. |
| **"How does this handle illiterate or rural applicants?"** | In Phase 3 of our roadmap, we integrate the **Bhashini Speech-to-Text API**. A rural dairy farmer can speak in Kathiawadi Gujarati or Marathi, our voice model extracts the 9 parameters, and feeds them into our deterministic engine. |
| **"What prevents someone from lying about their SC certificate?"** | In Phase 2, we integrate with **DigiLocker / e-Pramaan APIs** to cryptographically verify state-issued caste certificates at the profile step, eliminating self-declaration fraud. |
| **"How do you ensure bank branches actually have funds available?"** | In Phase 4, we integrate with the **Jan Samarth Portal API** and bank Core Banking Solutions (CBS) to ingest real-time uncommitted fiscal quota balances at the branch level. |
| **"How robust is your backend?"** | We have **60 automated pytest tests** covering unit logic, HTTP validation, boundary values, and end-to-end integration journeys with 100% pass rate. |
