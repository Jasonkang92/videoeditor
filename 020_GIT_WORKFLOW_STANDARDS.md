# Git Workflow Gold Standards (Enhanced)

## Table of Contents
1. [Branch Naming Conventions](#branch-naming-conventions)
2. [Branching Strategy (Git Flow)](#branching-strategy-git-flow)
3. [Commit Message Standards](#commit-message-standards)
4. [Pull Request Guidelines](#pull-request-guidelines)
5. [Code Review Process](#code-review-process)
6. [Merge Strategies](#merge-strategies)
7. [Release Management](#release-management)
8. [Conflict Resolution](#conflict-resolution)
9. [Rewriting History Safely](#rewriting-history-safely)
10. [Git Security & Best Practices](#git-security--best-practices)

---

## Branch Naming Conventions

### Branch Types

```
main/
  └─ Production-ready code, always deployable

develop/
  └─ Integration branch for features, release candidate

feature/
  ├─ feature/user-authentication
  ├─ feature/video-analysis-ui
  └─ feature/payment-integration

bugfix/
  ├─ bugfix/transcription-timeout
  └─ bugfix/memory-leak-in-player

hotfix/
  ├─ hotfix/critical-security-patch
  └─ hotfix/database-connection-pool

refactor/
  ├─ refactor/api-response-structure
  └─ refactor/consolidate-duplicate-logic

docs/
  └─ docs/deployment-guide
```

### Naming Rules

**Format:** `type/short-description`

```bash
✅ Good:
feature/user-authentication
bugfix/video-upload-timeout
hotfix/sql-injection-vulnerability
refactor/extract-transcription-logic

❌ Bad:
feature                          # No description
feature/user-auth-system-update  # Too long
FEATURE/user-auth                # Wrong case
feature-user-auth                # Wrong separator
```

### Branch Protection

Protect important branches:

```bash
# Branch protection rules (GitHub):
main:
  - Require pull request reviews before merging
  - Require approval from code owners
  - Dismiss stale pull request approvals
  - Require status checks to pass

develop:
  - Require pull request reviews (but allow dismissal)
  - Require status checks to pass
  - Allow force pushes (for rebasing)
```

---

## Branching Strategy (Git Flow)

### Flow Overview

```
main ──────────────────────→ Release Candidate Quality (PR → merge)
↑
├─ develop ──→ Feature PRs (reviewed, tested) → merge
│     ↑↑↑
│     ├─ feature/auth (PR #123)
│     ├─ feature/ui (PR #124)
│     └─ feature/api (PR #125)
│
└─ hotfix ──→ Critical production fixes (emergency only)
```

### Feature Development

1. **Create feature branch from develop**

```bash
# Update develop first
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/user-authentication

# Or more explicitly
git checkout -b feature/user-authentication origin/develop
```

2. **Develop locally with small commits**

```bash
# Commit frequently (small, logical units)
git add src/auth.py tests/test_auth.py
git commit -m "feat: implement JWT token generation"

git add src/api/routes/login.py
git commit -m "feat: add login endpoint with password validation"
```

3. **Keep feature branch updated**

```bash
# While developing, periodically sync with develop
git fetch origin
git rebase origin/develop    # Replay your commits on latest develop

# Or merge if preferred
git merge origin/develop
```

4. **Push to remote, create PR**

```bash
git push origin feature/user-authentication

# Create PR on GitHub with clear title and description
# Title: "feat: user authentication system"
# Description: "Implements JWT-based auth, validates on all protected routes"
```

### Bugfix Development

```bash
# Bugfix follows same flow, different branch type
git checkout -b bugfix/transcription-timeout develop

# Make fixes
git add backend/speech_to_text.py
git commit -m "fix: increase transcription timeout to 5m for long videos"

# PR and review same as features
```

### Hotfix (Critical Production Fix)

```bash
# Hotfix goes directly from main (emergency only!)
git checkout -b hotfix/security-patch main

# Make fix and test thoroughly
git add backend/auth.py
git commit -m "fix: prevent SQL injection in user search"

# Push directly for urgent security/availability issues
git push origin hotfix/security-patch

# Create PR against main, merge immediately after review
# Also merge back to develop to keep in sync
```

---

## Commit Message Standards

### Conventional Commits Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

```
feat:      New feature
fix:       Bug fix
refactor:  Code refactoring (no behavior change)
docs:      Documentation
test:      Test additions/changes
chore:     Build, ci, dependencies
perf:      Performance improvement
style:     Formatting, missing semicolons, whitespace
security:  Security fix
```

### Scope

```
(api)       API layer
(auth)      Authentication
(database)  Database operations
(ui)        Frontend UI
(perf)      Performance
(config)    Configuration
(deps)      Dependencies
```

### Examples

```bash
# Feature with scope
git commit -m "feat(auth): implement JWT token refresh mechanism

- Add refresh token endpoint
- Implements 24h refresh window
- Includes proper error handling
- Updates auth tests"

# Bug fix
git commit -m "fix(transcription): handle timeout errors gracefully

When transcription exceeds 5 minutes, retry with -log
error event instead of crashing.

Fixes: #234"

# Refactoring
git commit -m "refactor(api): extract response validation to middleware

No behavior change. Consolidates duplicated validation
logic into single middleware for cleaner routes.

Resolves technical debt noted in REFACTORING_SUMMARY.md"

# Documentation
git commit -m "docs: add deployment guide for production

Comprehensive guide covering environment setup,
database migrations, and monitoring setup."
```

### Commit Message Checklist

```
[ ] Starts with type(scope):
[ ] Uses imperative mood ("add", not "added" or "adds")
[ ] First line ≤ 50 characters
[ ] Blank line after subject
[ ] Body wrapped at 72 characters
[ ] References issue if applicable (Fixes #123)
[ ] Explains WHAT and WHY, not HOW
```

---

## Pull Request Guidelines

### PR Template

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Feature (new functionality)
- [ ] Bug fix (non-breaking)
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement
- [ ] Security fix

## Related Issue
Fixes #(issue number)

## Changes Made
- Specific change 1
- Specific change 2
- Specific change 3

## Testing Done
- [ ] Unit tests added/updated
- [ ] Integration tests passed
- [ ] Manual testing on staging environment
- [ ] Coverage: XX%

## Checklist
- [ ] Code follows project standards
- [ ] No hardcoded secrets or credentials
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Ready for code review
```

### PR Title Format

```
✅ Good:
feat: implement user authentication with JWT tokens
fix: resolve transcription timeout on videos >30min
refactor: consolidate duplicate validation logic
docs: add deployment troubleshooting guide

❌ Bad:
fix bug
update code
changes
WIP
TODO
```

### PR Scope

- **Size:** <400 lines of code (smaller is better)
- **Scope:** Single feature/fix/refactor
- **Dependencies:** Minimal. Flag if blocks other PRs
- **Breaking changes:** Document in PR body

---

## Code Review Process

See [013_CODE_REVIEW_STANDARDS.md](013_CODE_REVIEW_STANDARDS.md) for detailed review criteria.

**Reviewer checklist (quick reference):**
```
[ ] Understand context and requirements
[ ] Code follows standards
[ ] Tests included and sufficient
[ ] No performance regressions
[ ] No security issues
[ ] Documentation updated
[ ] Behavior unchanged (if refactoring)
```

---

## Merge Strategies

### Squash & Merge (Preferred for Features)

```bash
# GitHub: "Squash and merge" button

# Manual:
git checkout develop
git pull origin develop
git merge --squash feature/user-auth
git commit -m "feat: implement user authentication system"
git push origin develop
```

**Pros:**
- ✅ Clean history (one commit per feature)
- ✅ Easy to revert if needed
- ✅ Easier bisect for debugging

**When:** Features, bugfixes, refactoring

### Regular Merge (For Integration Branches)

```bash
git checkout develop
git pull origin develop
git merge --no-ff feature/user-auth
git push origin develop
```

**Pros:**
- ✅ Preserves feature branch history
- ✅ Clear when features were merged

**When:** Merging long-running feature branches

### Rebase & Merge (For Clean History)

```bash
# Replay commits on top of develop
git checkout feature/small-fix
git rebase origin/develop
git push origin feature/small-fix -f  # Force push after rebase

# Then regular merge
git checkout develop
git merge feature/small-fix
```

**Pros:**
- ✅ Linear history
- ✅ Easy to understand progression

**Cons:**
- ❌ Rewrites history (riskier if branch shared)

---

## Release Management

### Creating a Release

```bash
# Create release branch from develop
git checkout -b release/1.2.0 develop

# Update version numbers
echo "1.2.0" > VERSION

# Update CHANGELOG
git add -A
git commit -m "chore: bump version to 1.2.0"

# Create PR against main (not develop!)
git push origin release/1.2.0

# PR: Request review, ensure tests pass
```

### Publishing Release

```bash
# After PR approved, merge to main
git checkout main
git pull origin main
git merge --no-ff release/1.2.0

# Tag the release
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff release/1.2.0
git push origin develop

# Delete release branch
git branch -d release/1.2.0
git push origin -d release/1.2.0
```

### Creating GitHub Release

```bash
# On GitHub: Releases tab
# - Version: v1.2.0
# - Title: Version 1.2.0
# - Notes: Summarize features, fixes, breaking changes
# - Mark as latest release
```

---

## Conflict Resolution

### Rebase Conflicts

```bash
# During rebase, conflict detected
git rebase origin/develop
# CONFLICT (content): Merge conflict in src/api.py

# Fix conflict in editor (look for <<<< ==== >>>>)

# Mark as resolved
git add src/api.py

# Continue rebase
git rebase --continue
```

### Merge Conflicts

```bash
# During merge, conflict detected
git merge origin/develop
# Conflict in src/auth.py

# Resolve in editor
# Then stage
git add src/auth.py
git commit -m "merge: resolve conflict with develop"
```

### Avoiding Conflicts

```bash
# Keep branch up to date frequently
git fetch origin
git rebase origin/develop

# Small PRs = fewer conflicts
# Communicate with team about working areas
```

---

## Rewriting History Safely

### Interactive Rebase (Before PR)

```bash
# Only rewrite history on personal branches!
# ❌ Never rewrite public/main/develop history

git rebase -i HEAD~3  # Rebase last 3 commits

# Options:
# pick   - keep commit
# reword - keep but edit message
# squash - combine with previous
# drop   - remove commit

# After editing, force push (only to personal branch)
git push origin feature/my-fix -f
```

### ❌ Never Rewrite Public History

```bash
# ❌ DON'T DO THIS:
git reset --hard origin/develop~5  # Rewrites develop!
git push -f origin develop          # Catastrophe!

# This breaks everyone's local branches
```

---

## Git Security & Best Practices

### Pre-commit Hooks

Prevent secrets from being committed:

```bash
# Install pre-commit
pip install pre-commit

# Create .pre-commit-config.yaml
# See 000_SECURITY_CODING_STANDARDS.md for full config

pre-commit install
```

### Prevent Accidental Pushes

```bash
# Protect against force-push to main/develop
git config --global push.default tracking
git config --local push.default current

# Create git alias for safe push
git config --global alias.safepush '!git push origin $(git rev-parse --abbrev-ref HEAD)'
```

### Sign Commits (Optional but Recommended)

```bash
# Set up GPG signing
git config --global user.signingkey YOUR-KEY-ID
git config --global commit.gpgsign true

# Sign individual commits
git commit -m "message" -S

# Verify signatures
git log --show-signature
```

---

## Related Standards
- [013_CODE_REVIEW_STANDARDS.md](013_CODE_REVIEW_STANDARDS.md)
- [004_DEPLOYMENT_CICD_STANDARDS.md](004_DEPLOYMENT_CICD_STANDARDS.md)
- [000_SECURITY_CODING_STANDARDS.md](000_SECURITY_CODING_STANDARDS.md)

---

**Last Updated:** April 2026
**Status:** Gold Standard
