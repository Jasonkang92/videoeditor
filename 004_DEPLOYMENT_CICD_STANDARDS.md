# Deployment & CI/CD Standards

## Table of Contents
1. [Git Branching Strategy](#git-branching-strategy)
2. [Code Review Process](#code-review-process)
3. [Automated Testing Gates](#automated-testing-gates)
4. [Environment Management](#environment-management)
5. [Staging Requirements](#staging-requirements)
6. [Production Deployment](#production-deployment)
7. [Rollback Procedures](#rollback-procedures)
8. [Deployment Frequency](#deployment-frequency)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Infrastructure as Code](#infrastructure-as-code)
11. [Secrets Management](#secrets-management)
12. [Post-Deployment Verification](#post-deployment-verification)

---

## Git Branching Strategy

### Git Flow Model

```
main (stable releases)
  |
  +-- release/v1.2.0 (release branch)
  |     |
  |     +-- hotfix/critical-bug (critical fixes)
  |
develop (integration branch)
  |
  +-- feature/video-upload (feature branches)
  +-- feature/transcription
  +-- bug/fix-memory-leak
  +-- chore/update-dependencies
```

### Branch Naming Conventions

```
feature/          - New feature
  feature/video-upload
  feature/sentiment-analysis

fix/              - Bug fix
  fix/memory-leak
  fix/transcription-timeout

docs/             - Documentation only
  docs/api-guide
  docs/setup-instructions

test/             - Test additions
  test/transcription-coverage

chore/            - Dependencies, build, etc.
  chore/update-dependencies
  chore/upgrade-python

refactor/         - Code refactoring
  refactor/video-processor

hotfix/           - Critical production fixes
  hotfix/critical-security
```

### Branch Protection Rules (GitHub)

```
main branch:
  ✅ Require pull request reviews: 2 reviewers
  ✅ Require status checks to pass:
     - All tests passing
     - Security scan (bandit)
     - Coverage threshold (>85%)
  ✅ Require branches to be up to date before merge
  ✅ Restrict who can push: Only release manager
  ✅ Require signed commits

develop branch:
  ✅ Require pull request reviews: 1 reviewer
  ✅ Require status checks to pass
  ✅ Require branches to be up to date before merge
  ✅ Allow squash merging
```

---

## Code Review Process

### Pull Request Checklist

```markdown
# PR Checklist

## Code Quality
- [ ] Code follows style guide (Python/JavaScript standards)
- [ ] No hardcoded secrets or credentials
- [ ] No console logging of sensitive data
- [ ] Error handling is appropriate
- [ ] Code is DRY (no unnecessary duplication)

## Testing
- [ ] Unit tests written and passing
- [ ] Test coverage >85%
- [ ] Integration tests for API changes
- [ ] Edge cases tested

## Security
- [ ] Input validation implemented
- [ ] Output encoding applied
- [ ] No SQL injection vulnerabilities
- [ ] Authentication/authorization checks in place
- [ ] Dependencies scanned for vulnerabilities

## Documentation
- [ ] Code comments for complex logic
- [ ] API documentation updated
- [ ] README updated if needed
- [ ] Breaking changes documented

## Performance
- [ ] No obvious performance regressions
- [ ] Database queries optimized
- [ ] Large files loaded asynchronously
```

### Code Review Standards

```
Approval Criteria:
1. At least N reviewers approve (N = 1 for develop, 2 for main)
2. All status checks pass
3. No merge conflicts
4. PR is squashed/rebased (single commit to main)

Review Timeline:
- Standard PRs: Review within 24 hours
- Critical/hotfix: Review within 1 hour
- Block: Unreviewed PRs cannot merge to main

Review Comment Guidelines:
- Use "Request Changes" for blocking issues
- Use "Comment" for suggestions
- Be constructive and specific
```

---

## Automated Testing Gates

### Required Status Checks

```yaml
# GitHub Actions workflow - tests and linting must pass

jobs:
  quality:
    runs-on: ubuntu-latest
    
    steps:
      # Unit tests
      - name: Run unit tests
        run: pytest backend/ --cov=backend --cov-fail-under=85
      
      # Integration tests
      - name: Run integration tests
        run: pytest backend/tests/integration --timeout=60
      
      # Type checking
      - name: Type check with mypy
        run: mypy backend/
      
      # Linting
      - name: Lint with pylint
        run: pylint backend/
      
      # Security scanning
      - name: Security scan with bandit
        run: bandit -r backend/
      
      # Dependency audit
      - name: Check dependencies
        run: safety check
      
      # Code formatting
      - name: Check code format (black)
        run: black --check backend/
```

### Test Gate Matrix

```
Status Check          | Pass/Fail | Blocks Merge
==========================================
Unit Tests           | >=85%      | YES
Integration Tests    | 100% Pass  | YES
Linting             | No errors   | YES
Security Scan       | No critical | YES
Type Check          | No errors   | YES
Dependency Audit    | No critical | YES

Coverage Threshold:  85% (fail-under)
Test Timeout:       60 seconds max per test
Build Time Target:  <5 minutes
```

---

## Environment Management

### Environment Parity

```
All environments (dev, staging, prod) use:
- Same Python/Node versions
- Same database versions
- Same dependency versions
- Same configuration structure

Environment Variables:
- Development:  .env.local (not committed)
- Staging:      AWS Secrets Manager
- Production:   AWS Secrets Manager (encrypted)

Deployment Sequence:
1. Local development testing
2. Staging deployment (mirrors production)
3. Production deployment
```

### Environment Configuration

```python
# config.py
import os
from enum import Enum

class Environment(Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

ENVIRONMENT = Environment(os.getenv("ENVIRONMENT", "development"))

# Load environment-specific settings
if ENVIRONMENT == Environment.PRODUCTION:
    DEBUG = False
    LOG_LEVEL = "WARNING"
    DB_POOL_SIZE = 30
    CACHE_TTL = 3600
else:
    DEBUG = True
    LOG_LEVEL = "DEBUG"
    DB_POOL_SIZE = 5
    CACHE_TTL = 60
```

---

## Staging Requirements

### Pre-Production Testing

```
Staging Environment Checklist:
✅ Identical to production (infrastructure, configs)
✅ Real-like test data (anonymized production data)
✅ Full integration with external services
✅ Performance testing (load tests)
✅ Security testing (OWASP top 10)
✅ Smoke tests (happy path scenarios)
✅ Regression tests (verify no broken features)
✅ User acceptance testing (if needed)

Before Production Approval:
1. Run full test suite
2. Performance benchmarks meet targets
3. Security scan passes
4. No database migration issues
5. Rollback plan documented
6. On-call engineer confirmed
7. Stakeholder approval (if needed)
```

### Smoke Test Example

```python
# tests/smoke_test.py
def test_smoke_suite():
    """Basic smoke tests for core functionality."""
    
    # API health
    response = client.get("/health")
    assert response.status_code == 200
    
    # Database connectivity
    assert db.execute("SELECT 1").first() is not None
    
    # Authentication
    response = client.post("/login", json=valid_credentials)
    assert response.status_code == 200
    
    # Video upload
    response = client.post("/videos/upload", files=test_file)
    assert response.status_code in [200, 201]
    
    # API endpoints
    response = client.get("/videos?limit=10")
    assert response.status_code == 200
```

---

## Production Deployment

### Deployment Checklist

```
Pre-Deployment (24 hours before):
☐ Create deployment plan document
☐ Notify stakeholders
☐ Ensure rollback plan is documented
☐ On-call engineer confirmed available
☐ Run full test suite (all passing)
☐ Review all changes in staging
☐ Verify database migrations tested
☐ Confirm monitoring/alerts setup

Deployment Day:
☐ Start deployment during low-traffic window
☐ Tag release in git with version
☐ Build and test container image
☐ Deploy to production cluster
☐ Run smoke tests
☐ Monitor error rates and latency
☐ Check application logs for errors

Post-Deployment (2 hours):
☐ Monitor system metrics
☐ Verify all health checks passing
☐ Test critical user workflows
☐ Roll back if critical issues detected
☐ Document any issues post-deployment

Post-Deployment (24 hours):
☐ Full regression testing
☐ Performance benchmarks
☐ User feedback collection
```

### Deployment Steps

```bash
#!/bin/bash
# deploy-production.sh

set -e

VERSION=$1
ENVIRONMENT="production"

echo "Starting production deployment v${VERSION}"

# 1. Build Docker image
docker build -t video-analytics:${VERSION} .
docker push gcr.io/project/video-analytics:${VERSION}

# 2. Deploy to Kubernetes
kubectl set image deployment/api \
    api=gcr.io/project/video-analytics:${VERSION} \
    --namespace=production

# 3. Wait for rollout
kubectl rollout status deployment/api \
    --namespace=production \
    --timeout=5m

# 4. Run smoke tests
pytest tests/smoke_test.py --timeout=60

echo "Deployment v${VERSION} completed successfully"
```

---

## Rollback Procedures

### When to Roll Back

```
Automatic Rollback Triggers:
- Error rate > 5% for 1 minute
- Response time p95 > 5 seconds for 5 minutes
- Database connection failures
- Critical service dependencies down
- OOM (Out of Memory) errors

Manual Rollback Triggers:
- Critical data loss detected
- Security vulnerability discovered
- API contracts broken
- Major functionality unavailable
```

### Rollback Steps

```bash
#!/bin/bash
# rollback-production.sh

PREVIOUS_VERSION=$1
NAMESPACE="production"

echo "Starting rollback to v${PREVIOUS_VERSION}"

# 1. Stop current deployment
kubectl set image deployment/api \
    api=gcr.io/project/video-analytics:${PREVIOUS_VERSION} \
    --namespace=${NAMESPACE}

# 2. Wait for rollback
kubectl rollout status deployment/api \
    --namespace=${NAMESPACE} \
    --timeout=5m

# 3. Verify rollback
pytest tests/smoke_test.py --timeout=60

# 4. Notify team
echo "Rolled back to v${PREVIOUS_VERSION}"
```

---

## Deployment Frequency

### Target Deployment Metrics

```
Deployment Frequency:
Target: Multiple deployments per week
  - Ideal: 1-2 per week
  - Acceptable: 1 per week
  - Concerning: < 1 per month

Lead Time for Changes:
Target: < 1 hour from code merge to production
  - Ideal: < 15 minutes
  - Acceptable: < 1 hour

Mean Time to Recovery (MTTR):
Target: < 15 minutes
  - Tracks how quickly we recover from failures
  - Achieved through practice and automation

Change Failure Rate:
Target: < 15% deployment failure rate
  - Measured by deployments requiring rollback
  - Improved through testing and review
```

---

## CI/CD Pipeline

### Complete Pipeline (GitHub Actions)

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [develop]

jobs:
  # Stage 1: Quality Checks
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      
      - name: Install dependencies
        run: pip install -r requirements.txt
      
      - name: Run tests
        run: pytest --cov=backend --cov-fail-under=85
      
      - name: Lint
        run: pylint backend/
      
      - name: Security scan
        run: bandit -r backend/

  # Stage 2: Build Docker Image
  build:
    needs: quality
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          push: true
          tags: gcr.io/project/video-analytics:${{ github.sha }}

  # Stage 3: Deploy to Staging
  deploy-staging:
    needs: [quality, build]
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
    steps:
      - name: Deploy to staging
        run: |
          kubectl set image deployment/api \
            api=gcr.io/project/video-analytics:${{ github.sha }} \
            --namespace=staging

  # Stage 4: Deploy to Production
  deploy-production:
    needs: [quality, build]
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to production
        run: |
          kubectl set image deployment/api \
            api=gcr.io/project/video-analytics:${{ github.sha }} \
            --namespace=production
```

---

## Infrastructure as Code

### Kubernetes Deployment Example

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: production
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  
  selector:
    matchLabels:
      app: api
  
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: gcr.io/project/video-analytics:latest
        ports:
        - containerPort: 8000
        
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: database-url
        
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 1Gi
        
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

## Secrets Management

### Secrets in CI/CD

```yaml
# GitHub Actions secrets
- name: Deploy with secrets
  env:
    DATABASE_PASSWORD: ${{ secrets.DATABASE_PASSWORD }}
    API_KEY: ${{ secrets.API_KEY }}
  run: |
    ./scripts/deploy.sh
```

### Never in Git

```
❌ NEVER commit:
- .env files with real values
- AWS credentials
- API keys
- Database passwords
- Private keys

✅ USE:
- GitHub Secrets (encrypted)
- AWS Secrets Manager
- HashiCorp Vault
- .env.example (template only)
```

---

## Post-Deployment Verification

### Health Check Verification

```python
import requests
import time

def verify_deployment(api_url, max_retries=10):
    """Verify deployment is healthy."""
    for attempt in range(max_retries):
        try:
            response = requests.get(f"{api_url}/health", timeout=5)
            
            if response.status_code == 200:
                health = response.json()
                
                # Check all services
                if all(s.get("status") == "healthy" 
                       for s in health["services"].values()):
                    print("✓ Deployment healthy")
                    return True
                else:
                    print("⚠ Some services unhealthy")
                    return False
        
        except requests.RequestException as e:
            print(f"Health check attempt {attempt+1} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(5)
    
    raise Exception("Deployment health check failed")
```

---

**Last Updated**: April 2026  
**Version**: 1.0  
**Status**: Active
