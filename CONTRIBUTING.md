# Git & GitHub Workflow — SIH26092 Sahay

> **This document is the team's single source of truth for Git workflow.**
> All six members must read this before writing a single line of code.

---

## The Core Rule

```
main  =  stable  =  team-approved  =  NEVER develop here directly
```

Every developer works on a **feature branch**. Code reaches `main` only through a **Pull Request with at least one approval**.

---

## Who Owns What

| Pair | Members | Branch Prefix | Files They Own |
|---|---|---|---|
| **Pair 1 — Backend** | Ruchit + Jeet | `feature/backend-*` | `backend/` (excl. `partner_locator.py`) |
| **Pair 2 — Frontend** | Rudra + Bhagyashree | `feature/frontend-*` | `frontend/src/` (excl. `PartnerMap.jsx`) |
| **Pair 3 — Map + Data** | Jaymin + Anjali | `feature/partner-*` | `data/`, `backend/services/partner_locator.py`, `frontend/src/components/PartnerMap.jsx` |

---

## Branch Naming

```
feature/backend-recommender
feature/backend-calculator
feature/frontend-home
feature/frontend-profile
feature/frontend-result
feature/partner-data
feature/partner-map
fix/backend-validation
fix/frontend-loading
```

❌ **Never create:** `richie`, `develop`, `staging`, `backend`, `frontend`, `person1`

---

## Standard Workflow — Do This Every Time

### Step 1 — Start a new task
```bash
git switch main
git pull origin main
git switch -c feature/<your-task-name>
```

### Step 2 — Work and commit often
```bash
# after meaningful progress:
git status
git add path/to/specific/file.py   # ← stage specific files only, not git add .
git commit -m "feat(backend): implement scheme eligibility check"
git push -u origin feature/<your-task-name>
```
> Push at least once a day. If your laptop dies, your work lives on GitHub.

### Step 3 — Open a Pull Request
On GitHub: `feature/<your-task-name>` → `main`
- Write what you built and why
- Tag a reviewer from another pair

### Step 4 — Review & Merge
- Reviewer leaves comments or approves
- Fix comments → push again → re-request review
- Only after approval: merge the PR
- Delete the feature branch on GitHub after merge

---

## Shared / Contract Files — Extra Caution

These files belong to everyone. **Coordinate before touching them.**

| File | Talk to |
|---|---|
| `docs/api-contract.md` | All pairs |
| `docs/data-dictionary.md` | All pairs |
| `backend/schemas/*.py` | All pairs |
| `backend/data/schemes.json` | Pair 1 + Pair 3 |
| `backend/data/partners.json` | Pair 3 + Pair 1 |
| `frontend/src/App.jsx` | Pair 2 + check with others |
| `README.md` | All pairs |

**Contract change process:**
```
Proposal → Discussion → Affected pair agrees
→ Update docs/api-contract.md first
→ Update code
→ PR → Review → Merge
```

---

## Keeping Your Branch Up to Date

When `main` moves forward while you're working:

```bash
# 1. Save your current work first
git add <specific files>
git commit -m "wip: save progress before sync"

# 2. Fetch what's new on GitHub
git fetch origin

# 3. Update local main
git switch main
git pull origin main

# 4. Go back to your branch
git switch feature/<your-task-name>

# 5. Bring main's changes into your branch
git merge main

# 6. Resolve conflicts carefully (see below), then:
git push
```

---

## Merge Conflicts — Do Not Panic

**Never blindly click "Accept Ours" or "Accept Theirs".**

```
1. Stop.
2. Read both versions.
3. Check: who owns this file? (see ownership table above)
4. If it's a shared/contract file → ask the other pair first.
5. Resolve intentionally — keep both teams' work.
6. Run tests.
7. Commit the resolved file.
8. Push.
```

---

## Commit Message Format

```
<type>(<scope>): <short description>

type:  feat | fix | docs | test | refactor | chore
scope: backend | frontend | partner | contract | docs
```

Examples:
```
feat(backend): add EMI calculation to calculator.py
fix(frontend): correct project_cost field validation
docs(contract): update /api/partners response fields
test(backend): add boundary tests for ₹1.40L threshold
chore(partner): add Rajkot SCA to partners.json
```

---

## ⛔ Commands That Require Ruchit's Explicit Authorization

| Command | Risk |
|---|---|
| `git push --force` | Overwrites remote history — can delete teammates' work |
| `git reset --hard` | Destroys local uncommitted changes permanently |
| `git push origin main` | Direct push to protected branch |
| Deleting `.git/` | Destroys entire repository history |

If you think you need one of these, **stop and message Ruchit first.**

---

## Ruchit's Role (Repo Owner + Backend Lead)

- Maintains branch protection rules on GitHub
- Reviews integration PRs (anything touching shared contracts)
- Coordinates cross-pair API changes
- Has final say on merge conflicts in `docs/` and `backend/schemas/`
- Does NOT need to review every small feature PR

---

## Before You Write Any Code — Answer These 5 Questions

1. Which branch am I on? (`git branch`)
2. Is it up to date? (`git pull origin main`)
3. Which new branch will I create? (`feature/...`)
4. Which files will I touch? (are any shared/contract files?)
5. Who do I need to tell before changing a shared file?

---

## Quick Reference Card

```bash
# Start new work
git switch main
git pull origin main
git switch -c feature/<task>

# Save progress
git status
git add <specific-file>
git commit -m "feat(...): ..."
git push -u origin feature/<task>   # first push
git push                             # subsequent pushes

# Sync with main mid-task
git fetch origin
git switch main && git pull origin main
git switch feature/<task>
git merge main

# After PR merged — clean up locally
git switch main
git pull origin main
git branch -d feature/<task>    # delete local branch (safe)
```
