# API Contract — SIH26092 Sahay

> **FROZEN. Any change to field names, types, or endpoint paths MUST be logged in [`decision-log.md`](decision-log.md) and accepted by all affected pairs before merging.**

---

## Base URL

| Environment | URL |
|---|---|
| Local Development | `http://localhost:8000` |
| Frontend Proxy | `/api` (via Vite proxy → backend) |

---

## Endpoints

---

### 1. `POST /api/recommend`

**Owner**: Pair 1 (Ruchit + Jeet)  
**Purpose**: Returns the recommended NSFDC scheme, the next-best alternative, and structured reasoning.

#### Request Body
```json
{
  "has_sc_certificate": true,
  "annual_income": 300000,
  "purpose": "business",
  "project_cost": 380000,
  "activity_type": "dairy",
  "state": "Gujarat",
  "district": "Rajkot"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `has_sc_certificate` | boolean | ✓ | Core eligibility gate |
| `annual_income` | integer | ✓ | In INR. Cap: ₹5,00,000 |
| `purpose` | string | ✓ | `"business"` \| `"education"` |
| `project_cost` | integer | ✓ | In INR |
| `activity_type` | string | ✓ | e.g. `"dairy"`, `"kirana"`, `"btech"` |
| `state` | string | ✓ | Full state name e.g. `"Gujarat"` |
| `district` | string | ✓ | Full district name e.g. `"Rajkot"` |

#### Success Response `200 OK`
```json
{
  "eligible": true,
  "recommended_scheme": {
    "id": "term_loan",
    "name": "Term Loan Scheme",
    "interest_rate": 8.0,
    "max_project_cost": 5000000,
    "loan_cap": 4500000,
    "loan_percentage": 90,
    "tenure_months": 60,
    "moratorium_months": 6
  },
  "alternative_scheme": {
    "id": "udyam_nidhi",
    "name": "Udyam Nidhi Scheme",
    "interest_rate": 13.0,
    "max_project_cost": 500000,
    "loan_cap": 450000,
    "loan_percentage": 90,
    "tenure_months": 60,
    "moratorium_months": 0
  },
  "reasons": [
    "Project cost of ₹3,80,000 qualifies for the Term Loan Scheme (up to ₹50,00,000).",
    "Business activity (dairy) is supported under this scheme.",
    "Annual income of ₹3,00,000 is within the ₹5,00,000 eligibility ceiling."
  ],
  "rejected_schemes": [
    {
      "scheme_id": "micro_finance",
      "scheme_name": "Micro Finance Scheme",
      "rejection_reason": "Project cost ₹3,80,000 exceeds the Micro Finance limit of ₹1,40,000."
    },
    {
      "scheme_id": "educational_loan",
      "scheme_name": "Educational Loan Scheme",
      "rejection_reason": "Purpose is 'business', not 'education'."
    }
  ],
  "ineligibility_reason": null
}
```

#### Ineligible Response `200 OK`
```json
{
  "eligible": false,
  "recommended_scheme": null,
  "alternative_scheme": null,
  "reasons": [],
  "rejected_schemes": [],
  "ineligibility_reason": "Annual income ₹5,50,000 exceeds the maximum eligibility ceiling of ₹5,00,000."
}
```

---

### 2. `POST /api/calculate`

**Owner**: Pair 1 (Ruchit + Jeet)  
**Purpose**: Computes the financial breakdown given a scheme and project cost.

#### Request Body
```json
{
  "scheme_id": "term_loan",
  "project_cost": 380000
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `scheme_id` | string | ✓ | Must match a valid scheme `id` from `schemes.json` |
| `project_cost` | integer | ✓ | In INR |

#### Success Response `200 OK`
```json
{
  "scheme_id": "term_loan",
  "project_cost": 380000,
  "possible_loan": 342000,
  "own_contribution": 38000,
  "loan_percentage": 90,
  "interest_rate": 8.0,
  "tenure_months": 60,
  "moratorium_months": 6,
  "monthly_estimate": 6934,
  "total_repayable": 416040,
  "note": "EMI calculated after moratorium period. Monthly estimate is indicative only."
}
```

| Field | Type | Notes |
|---|---|---|
| `possible_loan` | integer | `min(project_cost × 0.90, scheme.loan_cap)` |
| `own_contribution` | integer | `project_cost - possible_loan` |
| `monthly_estimate` | integer | Standard amortized EMI in INR (rounded) |
| `total_repayable` | integer | `monthly_estimate × tenure_months` |

---

### 3. `GET /api/partners`

**Owner**: Pair 3 (Jaymin + Anjali) via `partner_locator.py`  
**Purpose**: Returns Channel Partners filtered and ranked for the user's profile.

#### Query Parameters

| Param | Type | Required | Notes |
|---|---|---|---|
| `state` | string | ✓ | e.g. `Gujarat` |
| `district` | string | ✓ | e.g. `Rajkot` |
| `scheme_id` | string | ✓ | e.g. `term_loan` |
| `lat` | float | ✗ | User latitude (for distance sort) |
| `lon` | float | ✗ | User longitude (for distance sort) |

#### Example Request
```
GET /api/partners?state=Gujarat&district=Rajkot&scheme_id=term_loan&lat=22.3039&lon=70.8022
```

#### Success Response `200 OK`
```json
{
  "partners": [
    {
      "id": "GJ-RJK-001",
      "name": "Gujarat Scheduled Castes Development Corporation (GSCDC)",
      "type": "SCA",
      "state": "Gujarat",
      "district": "Rajkot",
      "address": "Near Collector Office, Rajkot - 360001",
      "phone": "0281-2234567",
      "supported_schemes": ["term_loan", "micro_finance", "udyam_nidhi"],
      "latitude": 22.3039,
      "longitude": 70.8022,
      "fund_available": true,
      "no_overdues": true,
      "distance_km": 0.5,
      "rank_score": 95,
      "data_source": "NSFDC Annual Report 2023-24",
      "prototype_status": true
    }
  ],
  "total": 1,
  "filter_applied": {
    "state": "Gujarat",
    "district": "Rajkot",
    "scheme_id": "term_loan"
  }
}
```

> ⚠️ `prototype_status: true` means fund availability and overdue data are **indicative only** and not sourced from live CBS/banking systems.

---

### 4. `GET /api/health`

**Owner**: Pair 1  
**Purpose**: Liveness probe.

#### Response `200 OK`
```json
{ "status": "ok", "version": "1.0.0" }
```

---

## Error Responses

All errors follow this shape:

```json
{
  "detail": "Human-readable error message"
}
```

| HTTP Code | When |
|---|---|
| `422` | Pydantic validation failed (missing/wrong field types) |
| `404` | Scheme ID not found |
| `500` | Unexpected server error |
