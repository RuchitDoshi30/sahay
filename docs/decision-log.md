# Decision Log

Changes to the frozen API contract (endpoint paths, field names, types)
must be logged here and accepted by all affected pairs before merging.

---

## 2026-09 — Added unofficial `POST /api/result` (Jeet, Pair 1)

**What**: A temporary combined endpoint that calls `calculate_loan()` +
`find_partners()` together and returns one response, using a hardcoded
placeholder rule to pick a scheme instead of the real recommender.

**Why**: `docs/api-contract.md` only defines `/api/recommend`,
`/api/calculate`, `/api/partners`, `/api/health` — `/api/result` is
**not** part of the frozen contract. It exists only so Pair 2 (frontend)
can start building/testing the Result screen against a real combined
response while Ruchit's `/api/recommend` is still in progress.

**Status**: TEMPORARY. Must be either:
1. Replaced — `/api/result` calls the real `/api/recommend` instead of
   the placeholder rule once it's ready, or
2. Removed entirely if the team decides frontend should call the three
   contract endpoints separately instead of one combined one.

**Owner**: Jeet — flag this at the next checkpoint so the team decides
which path to take before final submission.