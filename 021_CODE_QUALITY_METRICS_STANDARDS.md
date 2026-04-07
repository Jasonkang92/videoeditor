# Code Quality Metrics Gold Standards

## Table of Contents
1. [Quality Metric Philosophy](#quality-metric-philosophy)
2. [Test Coverage Standards](#test-coverage-standards)
3. [Code Complexity Metrics](#code-complexity-metrics)
4. [Performance Metrics](#performance-metrics)
5. [Security Metrics](#security-metrics)
6. [Technical Debt Tracking](#technical-debt-tracking)
7. [Build & Deployment Metrics](#build--deployment-metrics)
8. [Monitoring Code Quality](#monitoring-code-quality)
9. [Code Quality Tools](#code-quality-tools)
10. [Reporting & Action Items](#reporting--action-items)

---

## Quality Metric Philosophy

### Metrics Drive Behavior

**Good metrics lead to good behavior. Bad metrics create perverse incentives.**

✅ **Good metrics:**
- Test coverage (drives testing)
- Build success rate (drives stability)
- Deployment frequency (drives automation)
- MTTR - Mean Time To Recovery (drives reliability)

❌ **Problematic metrics:**
- Lines of code (drives bloat)
- Number of bugs found (incentivizes finding instead of preventing)
- Code velocity (ignores quality)

### Setting Targets

```
Target metrics should be:
1. Achievable - Not so high that impossible
2. Meaningful - Correlate to quality
3. Data-driven - Based on historical performance
4. Reviewed quarterly - Adjust as needed
```

---

## Test Coverage Standards

### Coverage Targets

```
MINIMUM TARGETS:
├─ Overall: >80% line coverage
├─ Critical paths: >90% coverage
├─ Utility functions: >85% coverage
└─ UI components: >75% coverage

HOW TO MEASURE:
├─ Python: pytest --cov=backend
├─ JavaScript: vitest --coverage
└─ CI: Report on every PR
```

### What Counts as "Coverage"

✅ **Line coverage:** Did code execute?

```python
# Coverage examines lines like:
def calculate_discount(price, category):  # Line 1: measured
    if category == 'premium':          # Line 2: measured
        return price * 0.8             # Line 3: measured
    return price                        # Line 4: measured
```

❌ **Branch coverage is better:** All paths taken?

```python
# Without branch coverage, this looks covered:
def calculate_discount(price, category):
    if category == 'premium':
        return price * 0.8
    return price

# If we only test 'premium' case, line coverage = 100%
# But the 'else' path never tested!
```

### Coverage Configuration

**Python:**
```ini
# setup.cfg or .coveragerc
[coverage:run]
branch = True
source = backend
omit =
    */site-packages/*
    */tests/*
    */migrations/*

[coverage:report]
exclude_lines =
    pragma: no cover
    def __repr__
    raise NotImplementedError
```

**JavaScript:**
```javascript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
      ],
    },
  },
});
```

### Enforcing Coverage in CI

```yaml
# GitHub Actions
- name: Check test coverage
  run: |
    pytest backend/ --cov=backend --cov-fail-under=80
    # Fails if coverage < 80%
```

---

## Code Complexity Metrics

### Cyclomatic Complexity

**Definition:** Number of decision points (if/else, loops, etc.)

```python
# Complexity = 1 (linear)
def simple_function(x):
    return x * 2

# Complexity = 2 (one decision)
def with_condition(x):
    if x > 0:
        return x
    return 0

# Complexity = 5 (multiple conditions)
def complex_function(a, b, c):
    if a > 0:           # +1
        if b > 0:       # +1
            if c > 0:   # +1
                return a + b + c
            else:       # +1
                return a + b
        else:
            return a
    else:               # +1
        return 0
```

**Target:** Keep under 10 (ideally <5)

### Measuring Complexity

```bash
# Python
pip install pylint
pylint backend/ --disable=all --enable=too-many-branches

# JavaScript
npm install -D complexity-report
complexity-report src/
```

### Reducing Complexity

```python
# ❌ Complex function
def process_order(order, user, config):
    if order.status == 'pending':
        if user.is_premium:
            if config.enable_discount:
                price = order.total * 0.9
            else:
                price = order.total
        else:
            price = order.total
        
        if order.items > 5:
            shipping = 0
        else:
            shipping = 10
    else:
        return error
    
    return {price, shipping}

# ✅ Simple function (extract logic)
def process_order(order: Order, user: User, config: Config) -> OrderTotal:
    _validate_order_pending(order)
    
    price = _calculate_price(order, user, config)
    shipping = _calculate_shipping(order)
    
    return OrderTotal(price, shipping)

def _calculate_price(order, user, config) -> float:
    base_price = order.total
    if user.is_premium and config.enable_discount:
        return base_price * 0.9
    return base_price

def _calculate_shipping(order) -> float:
    return 0 if order.items > 5 else 10
```

---

## Performance Metrics

### API Response Times

```
TARGET SLAs:
├─ 95th percentile: <500ms
├─ 99th percentile: <1000ms
├─ Error rate: <0.1%
└─ Availability: >99.9%
```

### Measuring API Performance

```python
# Add timing middleware
@app.middleware("http")
async def measure_request_time(request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    
    # Log/track duration
    logger.info(f"{request.url.path}: {duration:.3f}s")
    response.headers["X-Process-Time"] = str(duration)
    
    return response
```

```typescript
// Frontend: Track API calls
const measureApiCall = async (url: string) => {
  const start = performance.now();
  const response = await fetch(url);
  const duration = performance.now() - start;
  
  // Send to analytics
  analytics.track('api_call', {
    url,
    duration,
    status: response.status,
  });
  
  return response;
};
```

### Database Query Performance

```python
# Identify slow queries
from django.db import connection
from django.test.utils import override_settings

# Log all queries
@override_settings(DEBUG=True)
def check_query_performance():
    queries = connection.queries
    slow = [q for q in queries if float(q['time']) > 0.1]
    
    if slow:
        logger.warning(f"Slow queries: {slow}")

# Use EXPLAIN to optimize
EXPLAIN ANALYZE
SELECT * FROM videos
WHERE user_id = 1
AND created_at > NOW() - INTERVAL 7 DAY
```

### Frontend Bundle Size

```
TARGET SIZES (gzipped):
├─ Core JS: <150 KB
├─ CSS: <50 KB
├─ Initial HTML: <20 KB
└─ Total: <250 KB
```

---

## Security Metrics

### Dependency Vulnerability Tracking

```bash
# Python
pip install safety
safety check --json > security-report.json

# JavaScript
npm audit --json > security-report.json

# Track metrics:
# - Total vulnerabilities
# - By severity (critical, high, medium, low)
# - Remediation rate
```

### Secret Detection

```bash
# Pre-commit hook
pip install detect-secrets

# Scan codebase
detect-secrets scan . > .secrets.baseline

# Verify no secrets in git history
git log -p | detect-secrets-custom detector all | grep -v "^--$" > /dev/null
```

### Security Incident Rate

```
Track:
- Vulnerabilities disclosed: 0 in production
- Security issues discovered in code review: Trend down
- Patch application time: <24 hours for critical
```

---

## Technical Debt Tracking

### Debt Quantification

```
Estimate debt in "ideal days":
- Code that's 3x harder to change = 3 days of tech debt per day written
- Complex function needs refactoring = 5 days of debt
- Missing tests = 2 days of debt for untested code

Total debt ÷ team capacity = months to pay down
```

### Debt Management

```
Guidelines:
- Document debt in code: # TODO: Refactor by Q3 2026
- Create issues: Label "technical-debt"
- Pay down 20% per sprint minimum
- Never let debt exceed 3 months of capacity
```

### Measuring Debt

```
Tools:
- SonarQube: Tracks issues over time
- CodeFactor: Provides debt score
- Custom: Count TODOs and FIXMEs

#!/bin/bash
# Count technical debt markers
echo "Technical Debt Indicators:"
echo "TODOs: $(grep -r "TODO" backend/ | wc -l)"
echo "FIXMEs: $(grep -r "FIXME" backend/ | wc -l)"
echo "Type: ignores: $(grep -r "type: ignore" backend/ | wc -l)"
```

---

## Build & Deployment Metrics

### Build Success Rate

```
Target: >99% success rate

Metric: Failed builds ÷ Total builds × 100%

Current: Aim for 99%+
├─ If <95%: Investigate chronic failures
├─ If >99%: Celebrate, document practices
└─ Review failing builds, fix root causes
```

### Deployment Frequency

```
Measure: How often can you deploy?

Gold Standard:
├─ Feature-ready: Can deploy any feature anytime
├─ Frequency: Weekly or more
├─ Lead time: <1 day from code to production
└─ MTTR: <1 hour to roll back if needed
```

### Incident Rate

```
Track metrics:
├─ P1/P2 incidents per month: Target <1/month
├─ MTTR (Mean Time to Recover): Target <30 min
├─ MTTD (Mean Time to Detect): Target <5 min
└─ Post-mortems: Document all P1s
```

---

## Monitoring Code Quality

### Continuous Quality Monitoring

```yaml
# GitHub Actions: Quality Checks
name: Quality Metrics

on: [pull_request, push]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Test coverage (Python)
        run: pytest backend/ --cov=backend --cov-fail-under=80
      
      - name: Test coverage (JavaScript)
        run: npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'
      
      - name: Code complexity
        run: pylint backend/ --disable=all --enable=too-many-branches
      
      - name: Security scan (Python)
        run: safety check
      
      - name: Security scan (JavaScript)
        run: npm audit
      
      - name: Dependency check
        run: |
          pip list > requirements-actual.txt
          diff requirements.txt requirements-actual.txt
      
      - name: Build check
        run: npm run build
```

---

## Code Quality Tools

### Python Tools

```python
# Coverage
pytest --cov=backend --cov-report=html
# Open htmlcov/index.html

# Complexity
pylint backend/  # Full lint
radon cc backend/ --min B  # Complexity only

# Code quality
sonarqube-scanner
```

### JavaScript Tools

```bash
# Coverage
npm test -- --coverage

# Complexity
npx complexity-report src/

# ESLint
npm run lint

# Type checking
npm run type-check
```

### Combined Dashboards

```
SonarQube:
├─ Coverage trends
├─ Code smells
├─ Security issues
├─ Debt tracking
└─ Gate enforcement

CodeFactor:
├─ Grade A-F
├─ Trend analysis
├─ PR feedback
└─ Auto-remediation
```

---

## Reporting & Action Items

### Quality Report (Monthly)

```markdown
# Code Quality Report - April 2026

## Coverage
- Backend: 85% (+2% from March)
- Frontend: 78% (+1% from March)
- Target: 80% (on track)

## Performance
- API 95p: 450ms (target <500ms) ✅
- API 99p: 850ms (target <1000ms) ✅
- Build time: 2m 15s (target <3m) ✅

## Security
- Critical CVEs: 0 ✅
- High CVEs: 1 (patching)
- Security incidents: 0 ✅

## Technical Debt
- Outstanding issues: 45
- New this month: 8
- Resolved this month: 5

## Action Items
1. Reduce high CVE in @package-name (due: 2026-04-15)
2. Improve frontend state mgmt coverage (target: 85%)
3. Investigate build timeout on Windows builds
```

### Quality Gates

```python
# Define quality gates that MUST pass
quality_gates = {
    "coverage": 80,          # Percent
    "complexity": 10,        # Average cyclomatic
    "security": "critical",  # Max severity allowed
    "build_time": 300,       # Seconds
    "api_latency_p95": 500,  # Milliseconds
}

# Enforce in CI
if actual_coverage < quality_gates["coverage"]:
    fail_pr("Coverage below threshold")
```

---

## Related Standards
- [003_TESTING_STANDARDS.md](003_TESTING_STANDARDS.md)
- [004_DEPLOYMENT_CICD_STANDARDS.md](004_DEPLOYMENT_CICD_STANDARDS.md)
- [008_PERFORMANCE_OPTIMIZATION_STANDARDS.md](008_PERFORMANCE_OPTIMIZATION_STANDARDS.md)
- [013_CODE_REVIEW_STANDARDS.md](013_CODE_REVIEW_STANDARDS.md)
- [000_SECURITY_CODING_STANDARDS.md](000_SECURITY_CODING_STANDARDS.md)

---

**Last Updated:** April 2026
**Status:** Gold Standard
