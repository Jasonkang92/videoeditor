# Code Review Gold Standards

## Table of Contents
1. [Review Fundamentals](#review-fundamentals)
2. [Pre-Review Checklist](#pre-review-checklist)
3. [Review Process](#review-process)
4. [Approval Criteria](#approval-criteria)
5. [Feedback Principles](#feedback-principles)
6. [Common Review Patterns](#common-review-patterns)
7. [Security & Performance Review](#security--performance-review)
8. [Testing & Coverage Review](#testing--coverage-review)
9. [Documentation Review](#documentation-review)
10. [Review Tools & Automation](#review-tools--automation)

---

## Review Fundamentals

Code reviews are the primary gate for quality and knowledge transfer. Every PR requires at least **one approval** from a code owner before merge.

**Goals of code review:**
- Catch bugs, security issues, and design flaws early
- Ensure code meets project standards (see 011_PYTHON_CODING_STANDARDS.md, 012_JAVASCRIPT_CODING_STANDARDS.md)
- Share knowledge across the team
- Build collective ownership

**Reviewer responsibilities:**
- Understand the context and requirements of the PR
- Check for correctness, readability, performance, and security
- Provide constructive, actionable feedback
- Approve only when code meets standards
- Be respectful and collaborative

---

## Pre-Review Checklist

**Author must ensure before requesting review:**

```
[ ] Branch name follows conventions (feature/*, bugfix/*, hotfix/*)
[ ] PR title is clear and descriptive
[ ] PR description explains WHAT and WHY (not just WHAT)
[ ] All commits are logical and well-messaged (see 020_GIT_WORKFLOW_STANDARDS.md)
[ ] All tests pass locally (CI must also pass)
[ ] Test coverage maintained or improved (see 021_CODE_QUALITY_METRICS_STANDARDS.md)
[ ] Code formatted (ESLint, Black, isort)
[ ] Type checks pass (mypy for Python, tsc for TypeScript)
[ ] No secrets or credentials in code
[ ] Documentation updated (README, docstrings, if applicable)
[ ] No merge conflicts
```

**Reviewer must do before starting review:**
- Read the PR description and linked issues
- Check the commit history for logical progression
- Review the diff on a clean checkout
- Run the code locally if touching critical paths

---

## Review Process

### Step 1: Understand the Context
- Read the issue/ticket the PR addresses
- Understand the acceptance criteria
- Check if this PR depends on other PRs

### Step 2: High-Level Review
- Does the approach make sense?
- Are there architectural concerns?
- Are there simpler solutions?
- Does this follow project standards?

### Step 3: Line-by-Line Review
- Read each changed line
- Check logic and correctness
- Verify error handling (see 007_ERROR_HANDLING_STANDARDS.md)
- Check for duplicated code (DRY principle)
- Look for security risks (see 000_SECURITY_CODING_STANDARDS.md)

### Step 4: Testing Review
- Are tests adequate? (see 003_TESTING_STANDARDS.md)
- Do tests verify the new behavior?
- Are edge cases covered?
- Would these tests catch future regressions?

### Step 5: Documentation Review
- Are docstrings/comments updated?
- Is the API documented (see 001_API_DESIGN_STANDARDS.md)?
- Are breaking changes noted?

---

## Approval Criteria

**Code MUST meet all criteria to be approved:**

### Correctness
- ✅ Logic is correct for the stated requirements
- ✅ No obvious bugs or edge case failures
- ✅ Error handling is appropriate (see 007_ERROR_HANDLING_STANDARDS.md)
- ✅ Database queries are optimized (see 006_DATABASE_STANDARDS.md)

### Standards Compliance
- ✅ Follows language standards (011_PYTHON_CODING_STANDARDS.md, 012_JAVASCRIPT_CODING_STANDARDS.md)
- ✅ Types are properly annotated (014_TYPE_SAFETY_STANDARDS.md)
- ✅ Security best practices followed (000_SECURITY_CODING_STANDARDS.md)
- ✅ API design conventions followed (001_API_DESIGN_STANDARDS.md)
- ✅ Configuration done correctly (018_CONFIGURATION_MANAGEMENT_STANDARDS.md)

### Testing
- ✅ Test coverage maintained or improved (target >80%, see 021_CODE_QUALITY_METRICS_STANDARDS.md)
- ✅ New code has unit tests
- ✅ Integration tests added if touching APIs
- ✅ All tests pass

### Performance
- ✅ No obvious performance regressions
- ✅ Database queries have proper indexes (see 006_DATABASE_STANDARDS.md)
- ✅ No N+1 query patterns
- ✅ Frontend bundle size impact assessed (see 008_PERFORMANCE_OPTIMIZATION_STANDARDS.md)

### Documentation
- ✅ Docstrings/comments explain WHY, not WHAT
- ✅ Complex logic is documented
- ✅ API changes documented
- ✅ README updated if needed

### Security (Critical)
- ✅ No hardcoded secrets (see 000_SECURITY_CODING_STANDARDS.md)
- ✅ Input validation applied (see 000_SECURITY_CODING_STANDARDS.md)
- ✅ Dependencies are secure (no known CVEs)
- ✅ Authentication/authorization correct

**If any criterion fails, request changes with specific feedback.**

---

## Feedback Principles

### Be Constructive, Not Critical
**❌ Don't:** "This code is ugly"
**✅ Do:** "This could be more readable by breaking into smaller functions with descriptive names"

**❌ Don't:** "Why would you do this?"
**✅ Do:** "Could we handle this edge case differently? I'm concerned about..."

### Ask Questions, Don't Demand
**❌ Don't:** "Change this to use a factory pattern"
**✅ Do:** "Have we considered a factory pattern here? It might help with..."

### Praise Good Work
```
// ✅ Great optimization here, moved the expensive operation out of the loop
// ✅ I like how you handled this error case with a retry mechanism
// ✅ Clean abstraction, easy to test in isolation
```

### Distinguish Blocking vs Non-Blocking
```
// MUST FIX: Security issue - this accepts unsanitized user input
// SHOULD FIX: Performance - consider caching this DOM query
// NICE TO HAVE: Use const instead of let here
```

### Respond to Author Feedback
- If author disagrees, discuss in comments
- If nothing is resolved, escalate to tech lead for decision
- Never approve with unresolved concerns

---

## Common Review Patterns

### Pattern: Refactoring + Feature in One PR
**❌ Don't:** Mix refactoring with feature development
**✅ Do:** Create separate PRs or ensure refactoring is minimal

### Pattern: Large PRs (>400 lines)
**❌ Problematic:** Hard to review, harder to revert if broken
**✅ Do:** Split into logical, smaller PRs
If unavoidable: Alert reviewers, provide detailed description, build in stages

### Pattern: Bug Fix
- Link to issue/bug report
- Include test that reproduces the bug
- Show test passes after fix
- Consider if this bug exists elsewhere

### Pattern: Performance Optimization
- Include benchmark results (before/after)
- Explain the trade-offs
- Verify no functionality changes
- Consider memory implications

### Pattern: Dependency Updates
- Run full test suite
- Check for breaking changes in changelogs
- Update lock files properly
- Document any API changes needed

---

## Security & Performance Review

### Security Review Checklist
```
[ ] No hardcoded credentials, API keys, or tokens
[ ] Input validation on all external data
[ ] SQL queries use parameterized statements (no string concatenation)
[ ] Authentication checks present on protected endpoints
[ ] Rate limiting/throttling considered
[ ] CORS settings appropriate (see 000_SECURITY_CODING_STANDARDS.md)
[ ] No sensitive data in logs or error messages
[ ] Dependencies have no known CVEs
[ ] Secrets not in version control
```

### Performance Review Checklist
```
[ ] No N+1 database queries
[ ] Appropriate caching strategies applied
[ ] Bundle size within limits
[ ] No memory leaks (especially in React useEffect)
[ ] Async operations don't block main thread
[ ] Database indexes present for queries
[ ] API endpoints have reasonable response times
[ ] No infinite loops or recursive patterns
```

---

## Testing & Coverage Review

**Minimum test requirements:**
- New code has unit tests
- Happy path and error paths tested
- Edge cases covered (null, empty, boundary values)
- Integration tests for API changes
- E2E tests for user flows

**Coverage expectations:**
```
Python backend: >80% line coverage
JavaScript frontend: >80% line coverage  
Critical paths: >90% coverage
```

See [003_TESTING_STANDARDS.md](003_TESTING_STANDARDS.md) for detailed testing requirements.

---

## Documentation Review

**Comments must explain WHY, not WHAT:**

```python
# ✅ Good: Explains reasoning
# We use exponential backoff instead of immediate retry to avoid
# overwhelming the downstream service during temporary outages
for attempt in range(5):
    time.sleep(2 ** attempt)
    
# ❌ Bad: Just restates the code
# Loop 5 times
for i in range(5):
    ...
```

**Docstrings required for:**
- All public functions/classes
- Complex internal functions
- API endpoints
- Configuration options

```python
# ✅ Good docstring
def calculate_discount(price: float, customer_tier: str) -> float:
    """
    Calculate discount based on customer tier.
    
    Args:
        price: Original price in USD
        customer_tier: One of 'bronze', 'silver', 'gold', 'platinum'
        
    Returns:
        Final price after discount applied
        
    Raises:
        ValueError: If customer_tier is invalid
        
    Example:
        >>> calculate_discount(100.0, 'gold')
        80.0
    """
```

---

## Review Tools & Automation

### Automated Checks (Must Pass Before Review)
```yaml
Pre-commit hooks:
  - Type checking (mypy, pyright)
  - Linting (ESLint, pylint)
  - Code formatting (Prettier, Black)
  
CI Pipeline:
  - Unit tests (threshold: 80% coverage)
  - Integration tests
  - Security scanning (see 000_SECURITY_CODING_STANDARDS.md)
  - Dependency vulnerability checks
  - Build validation
```

### Review Tools
- **GitHub**: Use code review features (suggest changes, approve, comment)
- **Conversation**: Use threaded comments for context
- **Automation**: Set up status checks requiring approvals before merge

### Review Metrics
```
Target metrics:
- Review turnaround: <24 hours for standard PRs
- Review thoroughness: Catch >70% of issues pre-production
- Approval rate: >80% approved, <20% require changes
```

See [021_CODE_QUALITY_METRICS_STANDARDS.md](021_CODE_QUALITY_METRICS_STANDARDS.md) for detailed metrics.

---

## Related Standards
- [000_SECURITY_CODING_STANDARDS.md](000_SECURITY_CODING_STANDARDS.md)
- [001_API_DESIGN_STANDARDS.md](001_API_DESIGN_STANDARDS.md)
- [003_TESTING_STANDARDS.md](003_TESTING_STANDARDS.md)
- [007_ERROR_HANDLING_STANDARDS.md](007_ERROR_HANDLING_STANDARDS.md)
- [011_PYTHON_CODING_STANDARDS.md](011_PYTHON_CODING_STANDARDS.md)
- [012_JAVASCRIPT_CODING_STANDARDS.md](012_JAVASCRIPT_CODING_STANDARDS.md)
- [014_TYPE_SAFETY_STANDARDS.md](014_TYPE_SAFETY_STANDARDS.md)
- [020_GIT_WORKFLOW_STANDARDS.md](020_GIT_WORKFLOW_STANDARDS.md)
- [021_CODE_QUALITY_METRICS_STANDARDS.md](021_CODE_QUALITY_METRICS_STANDARDS.md)

---

**Last Updated:** April 2026
**Status:** Gold Standard
