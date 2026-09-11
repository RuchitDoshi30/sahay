# Sahay — SIH26092
### NSFDC Scheme Recommendation & Channel Partner Guidance Platform

> **"No Wrong Door"** — Empowering Scheduled Caste beneficiaries to find the right NSFDC scheme, understand their exact loan & own contribution, and reach verified Channel Partners in one seamless journey.

---

## Project Overview

| Item | Detail |
|---|---|
| **SIH Problem ID** | SIH26092 |
| **Organisation** | National Scheduled Castes Finance & Development Corporation (NSFDC) |
| **Stack** | React + Vite + Bootstrap (Frontend) · Python + FastAPI (Backend) · JSON data files |
| **Map** | React Leaflet + OpenStreetMap |
| **Architecture** | 5-screen SPA → 3 FastAPI endpoints → Rule-based recommendation + EMI math |

---

## Team Ownership

| Pair | Members | Primary Files |
|---|---|---|
| **Pair 1 — Backend** | Ruchit + Jeet | `backend/app.py`, `backend/routes/`, `backend/schemas/`, `backend/services/recommender.py`, `backend/services/calculator.py`, `backend/data/schemes.json`, `backend/tests/` |
| **Pair 2 — Frontend** | Rudra + Bhagyashree | `frontend/src/pages/`, `frontend/src/components/`, `frontend/src/services/`, `frontend/src/context/`, `frontend/src/mock/`, `frontend/src/App.jsx` |
| **Pair 3 — Map & Data** | Jaymin + Anjali | `data/`, `backend/services/partner_locator.py`, `backend/data/partners.json`, `frontend/src/components/PartnerMap.jsx` |

---

## 5-Screen User Journey

```
HOME → PROFILE → RESULT → PARTNERS → SUMMARY
```

1. **Home** — Problem introduction, language toggle (EN/HI), CTA
2. **Profile** — "Tell Us Your Need" — 6-question eligibility form
3. **Result** — Recommended scheme + Why + Why not alternatives + Financial breakdown
4. **Partners** — Interactive Leaflet map + ranked Channel Partner cards
5. **Summary** — Printable application-ready summary slip

---

## API Endpoints

| Method | Endpoint | Owner | Description |
|---|---|---|---|
| POST | `/api/recommend` | Pair 1 | Returns scheme recommendation + reasons |
| POST | `/api/calculate` | Pair 1 | Returns loan, own contribution, EMI |
| GET | `/api/partners` | Pair 3 | Returns filtered + ranked partner list |
| GET | `/api/health` | Pair 1 | Health check |

**Full contract → [`docs/api-contract.md`](docs/api-contract.md)**

---

## Quick Start

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

> **Offline mode**: If the backend is unreachable, the frontend automatically falls back to `src/mock/` data. The UI will never show a blank screen.

---

## Mandatory Demo Profile (Rajkot Dairy)

| Field | Value |
|---|---|
| SC Certificate | ✓ Yes |
| Annual Income | ₹3,00,000 |
| Purpose | Business |
| Activity | Dairy |
| Project Cost | ₹3,80,000 |
| State / District | Gujarat / Rajkot |

**Expected Output:**
- Scheme: **Term Loan** (₹3,42,000 loan · ₹38,000 own contribution)
- Rejected: Micro Finance (cost exceeds ₹1.40L cap) — explained clearly
- Partners: Rajkot-area SCA + authorized RRBs on map

---

## Project Structure

```
sahay/
├── README.md
├── .gitignore
├── .env.example
│
├── docs/                          # ← Frozen contracts (read before coding)
│   ├── api-contract.md
│   ├── data-dictionary.md
│   ├── architecture.md
│   ├── decision-log.md
│   ├── demo-script.md
│   ├── test-scenarios.md
│   └── sources.md
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── pages/               (Pair 2)
│       ├── components/          (Pair 2 + Pair 3: PartnerMap)
│       ├── services/            (Pair 2)
│       ├── context/             (Pair 2)
│       ├── mock/                (Pair 2)
│       ├── utils/
│       ├── constants/
│       └── styles/
│
├── backend/
│   ├── app.py                   (Pair 1)
│   ├── requirements.txt
│   ├── routes/                  (Pair 1)
│   ├── schemas/                 (Pair 1 — shared contract)
│   ├── services/                (Pair 1 + Pair 3: partner_locator)
│   ├── data/                    (Pair 1 + Pair 3)
│   ├── utils/
│   ├── tests/                   (Pair 1)
│   └── examples/
│
├── data/                        (Pair 3)
│   ├── raw/
│   ├── cleaned/
│   └── test/
│
├── tests/
│   └── integration/
│
└── demo/
    ├── screenshots/
    ├── recording/
    ├── backup/
    └── presentation/
```

---

## Checkpoints → [`docs/CHECKPOINTS.md`](docs/CHECKPOINTS.md)

| # | Gate | Proof Required |
|---|---|---|
| 1 | Structure Locked | Frozen fields, JSON contract, file ownership |
| 2 | Parts Work Alone | Each module runs independently with mocks |
| 3 | Parts Connect | Real POST to backend, live map markers |
| 4 | Full Journey | Rajkot dairy 13/15 profiles pass end-to-end |
| 5 | SIH Ready | Hosted link, recording, 3-min pitch prepared |

---

## Test Profiles → [`docs/test-scenarios.md`](docs/test-scenarios.md)

15 agreed personas covering all boundary conditions. Run:
```bash
cd backend
pytest tests/ -v
```