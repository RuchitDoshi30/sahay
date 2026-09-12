# Test Scenarios & Quality Assurance Matrix — SIH26092 Sahay

> **Quality Assurance, Boundary Verification & Test Automation Suite**  
> **Lead Architect & Backend Lead:** Ruchit  
> **Repository Branch:** `feature/backend-recommendation`  
> **Current Verification Status:** **60 Passed | 0 Failed | 100% Core Coverage**

---

## 1. Test Harness Overview & Execution

The Sahay platform enforces test-driven verification across all core business logic and API endpoints. The automated suite evaluates mathematical boundaries, statutory exclusion rules, Pydantic schema validation, and end-to-end user journeys.

### Executing the Test Suite:
```bash
# From workspace root
cd backend
python -m pytest tests/ -v --tb=short

# Expected Output:
# tests/test_calculator.py::... PASSED [  5%]
# tests/test_recommender.py::... PASSED [ 61%]
# tests/test_routes.py::... PASSED [100%]
# ========================= 60 passed in 0.42s =========================
```

### Breakdown of Automated Test Files:
| Test File | Author / Owner | Tests | Scope | Status |
|---|---|:---:|---|:---:|
| `tests/test_recommender.py` | Pair 1 (Ruchit) | **34** | Pure deterministic rule engine logic, income boundaries, project cost brackets, reason generation. | **PASSED** |
| `tests/test_routes.py` | Pair 1 (Ruchit) | **26** | HTTP layer, Pydantic input coercion, status codes (200, 404, 422), headers, and full journey integration. | **PASSED** |
| `tests/test_calculator.py` | Pair 1 (Jeet) | **3** | Amortization math, margin money calculation, loan cap clamping. | **PASSED** |
| `tests/test_partner_locator.py`| Pair 3 (Jaymin) | **0** | Channel partner geo-filtering, distance calculation, scheme match. | *PENDING (Pair 3)* |

---

## 2. Comprehensive Test Scenario Catalog

---

### Category A — Happy Path Functional Scenarios

#### A1: Rajkot Dairy Expansion (Canonical Hackathon Scenario)
- **Input:** `has_sc_certificate: true`, `annual_income: 300000`, `purpose: "business"`, `project_cost: 380000`, `activity_type: "dairy"`, `state: "Gujarat"`, `district: "Rajkot"`
- **Expected Outcome:**
  - `eligible: true`
  - `recommended_scheme.id: "term_loan"`
  - `alternative_scheme.id: "udyam_nidhi"`
  - `reasons`: Contains plain-language rationale referencing ₹3,80,000 project cost and dairy activity.
  - `rejected_schemes`: Lists `micro_finance` with reason stating cost exceeds ₹1,40,000.
  - `ineligibility_reason: null`
- **Statutory Rule:** Cost > ₹1,40,000 and <= ₹50,00,000 qualifies for Term Loan; cost <= ₹5,00,000 makes Udyam Nidhi an eligible secondary alternative.

#### A2: Nano Kirana Store Self-Employment
- **Input:** Same profile, but `project_cost: 100000`, `activity_type: "kirana"`
- **Expected Outcome:**
  - `recommended_scheme.id: "micro_finance"`
  - `alternative_scheme.id: "aajeevika_microfinance"`
  - `rejected_schemes`: Excludes educational loan and large term loan.
- **Statutory Rule:** Cost <= ₹1,40,000 prioritizes Micro Finance Scheme.

#### A3: Higher Education (B.Tech Tuition & Hostel)
- **Input:** Same profile, but `purpose: "education"`, `activity_type: "btech"`, `project_cost: 600000`
- **Expected Outcome:**
  - `recommended_scheme.id: "educational_loan"`
  - `alternative_scheme: null`
  - `rejected_schemes`: All business schemes rejected with reason `"Purpose is education, not business"`.
- **Statutory Rule:** Purpose gate routes strictly to Educational Loan Scheme (up to ₹40L).

---

### Category B — Statutory Income Boundary Verifications

#### B1: Exactly at Statutory Income Ceiling (₹5,00,000)
- **Input:** `annual_income: 500000` (alongside valid profile)
- **Expected Outcome:** `eligible: true`
- **Statutory Rule:** MoSJE guideline defines ceiling as inclusive ($\le ₹5,00,000$).

#### B2: One Rupee Over Statutory Income Ceiling (₹5,00,001)
- **Input:** `annual_income: 500001`
- **Expected Outcome:**
  - `eligible: false`
  - `recommended_scheme: null`
  - `alternative_scheme: null`
  - `ineligibility_reason`: Mentions statutory ceiling violation with exact income echoed.
- **Statutory Rule:** Income $> ₹5,00,000$ triggers immediate disqualification under NSFDC charter.

#### B3: Minimum Valid Positive Income (₹1)
- **Input:** `annual_income: 1`
- **Expected Outcome:** `eligible: true` (Lowest economic bracket eligible for priority micro-credit).

---

### Category C — Project Cost Boundary Verifications

#### C1: Exactly at Micro Finance Ceiling (₹1,40,000)
- **Input:** `project_cost: 140000`
- **Expected Outcome:** `recommended_scheme.id: "micro_finance"`
- **Statutory Rule:** Boundary is inclusive ($\le ₹1,40,000$).

#### C2: One Rupee Over Micro Finance Ceiling (₹1,40,001)
- **Input:** `project_cost: 140001`
- **Expected Outcome:** `recommended_scheme.id: "term_loan"`
- **Statutory Rule:** Cost $> ₹1,40,000$ transitions immediately to Term Loan Scheme.

#### C3: Exactly at Udyam Nidhi Alternative Ceiling (₹5,00,000)
- **Input:** `project_cost: 500000`
- **Expected Outcome:**
  - `recommended_scheme.id: "term_loan"`
  - `alternative_scheme.id: "udyam_nidhi"`
- **Statutory Rule:** Udyam Nidhi supports projects up to ₹5,00,000.

#### C4: One Rupee Over Udyam Nidhi Ceiling (₹5,00,001)
- **Input:** `project_cost: 500001`
- **Expected Outcome:**
  - `recommended_scheme.id: "term_loan"`
  - `alternative_scheme: null`
- **Statutory Rule:** Cost $> ₹5,00,000$ exceeds Udyam Nidhi parameters, leaving no business alternative.

#### C5: Maximum Supported Term Loan Project Cost (₹50,00,000)
- **Input:** `project_cost: 5000000`
- **Expected Outcome:** `recommended_scheme.id: "term_loan"`, `possible_loan: 4500000` (90% cap).

#### C6: Exceeds Maximum Supported Project Cost (₹50,00,001)
- **Input:** `project_cost: 5000001`
- **Expected Outcome:**
  - `eligible: false`
  - `ineligibility_reason`: Explains that project cost exceeds NSFDC's maximum allowable limit of ₹50,00,000.

---

### Category D — Statutory Caste Certificate Exclusion Gate

#### D1: Non-SC Applicant (`has_sc_certificate: false`)
- **Input:** `has_sc_certificate: false`, all other values valid.
- **Expected Outcome:**
  - `eligible: false`
  - `recommended_scheme: null`
  - `ineligibility_reason`: Indicates that NSFDC assistance is restricted to members of the Scheduled Caste community.
- **Statutory Rule:** Pre-emptive evaluation gate; short-circuits engine execution without evaluating financial criteria.

#### D2: Certified SC Applicant (`has_sc_certificate: true`)
- **Input:** `has_sc_certificate: true`
- **Expected Outcome:** Gate cleared; proceeds to income and project sizing checks.

---

### Category E — Purpose & Linguistic Normalization

#### E1: Unsupported Loan Purpose (`"travel"`, `"wedding"`, `"medical"`)
- **Input:** `purpose: "travel"`
- **Expected Outcome:** `eligible: false`, `ineligibility_reason` clarifies that NSFDC provides loans only for productive self-employment businesses or higher education.

#### E2: Case-Insensitive Normalization (`"BUSINESS"`, `"Education"`, `"bUsInEsS"`)
- **Input:** `purpose: "BUSINESS"`
- **Expected Outcome:** Successfully normalized and routed identically to lowercase `"business"`.

#### E3: Educational Loan Cap Boundary (₹40,00,001)
- **Input:** `purpose: "education"`, `project_cost: 4000001`
- **Expected Outcome:** `eligible: false`, `ineligibility_reason` notes educational ceiling is ₹40,00,000.

---

### Category F — HTTP API Schema & Error Validation

#### F1: Missing Required Field (422 Unprocessable Entity)
- **Request:** `POST /api/recommend` omitting `"annual_income"`.
- **Expected Status:** `422 Unprocessable Entity` with Pydantic field location `loc: ["body", "annual_income"]`.

#### F2: Non-Numeric Value for Integer Field (422 Unprocessable Entity)
- **Request:** `POST /api/recommend` with `"project_cost": "three_lakh"`.
- **Expected Status:** `422 Unprocessable Entity`.

#### F3: Zero or Negative Project Cost (422 Unprocessable Entity)
- **Request:** `POST /api/recommend` with `"project_cost": 0` or `-50000`.
- **Expected Status:** `422 Unprocessable Entity` (Pydantic `gt=0` constraint).

#### F4: Non-Existent Scheme in Calculation (404 Not Found)
- **Request:** `POST /api/calculate` with `scheme_id: "imaginary_scheme"`.
- **Expected Status:** `404 Not Found` with `detail: "Scheme imaginary_scheme not found"`.

#### F5: Missing Query Parameters in Partner Search (422 Unprocessable Entity)
- **Request:** `GET /api/partners?district=Rajkot` (omitting required `state`).
- **Expected Status:** `422 Unprocessable Entity`.

---

### Category G — End-to-End Integration Journey

#### G1: Sequential Pipeline Consistency (Profile → Recommend → Calculate → Partners)
1. **Step 1:** Call `POST /api/recommend` with Rajkot dairy profile → Receive `scheme_id: "term_loan"`.
2. **Step 2:** Call `POST /api/calculate` passing returned `scheme_id` and original `project_cost` → Receive `possible_loan: 342000`, `monthly_estimate: 6934`.
3. **Step 3:** Call `GET /api/partners?state=Gujarat&district=Rajkot&scheme_id=term_loan` → Receive verified list of partners matching district and scheme.
- **Verification Rule:** Output of each stage provides exactly the keys required by the subsequent endpoint without manual data manipulation.

---

### Category H — Determinism & Zero-Drift Verification

#### H1: 100-Iteration Deterministic Execution
- **Action:** Execute identical Rajkot dairy payload 100 consecutive times against `/api/recommend`.
- **Expected Outcome:** 100% of responses are byte-for-byte identical.
- **Compliance Rule:** Guarantees zero random seed, zero state leakage, and zero AI hallucination in public eligibility scoring.

---

## 3. Pending Test Coverage (Pair 3 Action Items)

To achieve 100% repository-wide test coverage, Pair 3 must implement the following tests in `backend/tests/test_partner_locator.py`:
1. `test_partner_state_district_filtering`: Verify filtering by exact state and district.
2. `test_partner_scheme_filtering`: Verify partner is returned only if it supports the requested `scheme_id`.
3. `test_partner_distance_ranking`: Verify partners are sorted in ascending order of `distance_km` when coordinates are supplied.
4. `test_partner_gps_omission_fallback`: Verify partner returns valid list even when `latitude` and `longitude` are null.
5. `test_partner_empty_district`: Verify graceful empty list `partners: []` when querying a remote district with no accredited SCA branch.
