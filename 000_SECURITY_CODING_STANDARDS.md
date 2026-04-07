# Security Coding Gold Standards

## Table of Contents
1. [Secrets Management](#secrets-management)
2. [Authentication & Authorization](#authentication--authorization)
3. [Input Validation & Output Encoding](#input-validation--output-encoding)
4. [API Security](#api-security)
5. [Dependency Security](#dependency-security)
6. [Code Security](#code-security)
7. [Database Security](#database-security)
8. [Security Testing](#security-testing)
9. [GitHub & Repository Security](#github--repository-security)
10. [Infrastructure Security](#infrastructure-security)
11. [Incident Response & Incident Handling](#incident-response--incident-handling)
12. [Security Checklist](#security-checklist)

---

## Secrets Management

### ❌ CRITICAL: Never Commit Secrets

**Any API key, password, token, or credential committed to GitHub can be compromised immediately.**

### Environment Variables

#### Python Backend
```python
# ✅ CORRECT: Load from environment
import os
from dotenv import load_dotenv

load_dotenv()  # Load from .env file

# Never commit .env!
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
JWT_SECRET = os.getenv("JWT_SECRET_KEY")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")

# Verify required secrets exist
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable not set")

# ❌ WRONG: Hardcoded secrets
GOOGLE_API_KEY = "AIzaSyD..."  # 🔴 NEVER DO THIS
API_SECRET = "sk_live_51..."   # 🔴 NEVER DO THIS
```

#### JavaScript/Frontend
```javascript
// ✅ CORRECT: Use environment variables
// .env.local (never commit!)
VITE_API_URL=https://api.example.com
VITE_PUBLIC_API_KEY=pk_public_abc123xyz  // Only public keys here

// src/config.js
export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  // Never expose secrets in frontend code
};

// ❌ WRONG: Hardcoded in code
const API_KEY = "sk_live_secret_key";  // 🔴 NEVER DO THIS

// ❌ WRONG: In config file that's committed
// config.prod.js
export const API_KEY = "sk_live_abc123";  // 🔴 NEVER DO THIS
```

### .env File Structure

```bash
# ✅ backend/.env (DO NOT COMMIT)
# Copy from .env.example for setup

# Google Cloud
GOOGLE_API_KEY=your_actual_api_key_here
GOOGLE_PROJECT_ID=your_project_id

# Database
DATABASE_URL=postgresql://user:password@localhost/dbname
DATABASE_PASSWORD=actual_db_password

# Authentication
JWT_SECRET_KEY=your_long_random_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# API Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://example.com
API_TIMEOUT_SECONDS=30

# Stripe/Payment
STRIPE_SECRET_KEY=sk_live_actual_key_here
STRIPE_WEBHOOK_SECRET=whsec_actual_secret_here

# Server
DEBUG=False
ENVIRONMENT=production
```

### .env.example (Commit This)

```bash
# ✅ backend/.env.example - Commit to GitHub
# Copy this file to .env and fill in values

# Google Cloud
GOOGLE_API_KEY=your_api_key_here
GOOGLE_PROJECT_ID=your_project_id

# Database
DATABASE_URL=postgresql://user:password@localhost/dbname
DATABASE_PASSWORD=your_db_password

# Authentication
JWT_SECRET_KEY=your_long_random_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# API Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://example.com
API_TIMEOUT_SECONDS=30

# Stripe/Payment
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Server
DEBUG=False
ENVIRONMENT=production
```

### Secrets Detection Tools

```bash
# Install and use git-secrets to prevent commits
# https://github.com/awslabs/git-secrets

# Install
brew install git-secrets
git secrets --install -f  # Install hooks in .git/hooks

# Scan for secrets in commits
git secrets --scan

# Scan all history
git secrets --scan-history

# Scan files for sensitive data
git secrets --scan-unstaged

# Configure patterns to detect
git secrets --add-provider -- cat ~/.git-secrets-patterns
```

### Pre-commit Hook Setup

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ["--baseline", ".secrets.baseline"]
        exclude: templates

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: check-added-large-files
        args: ["--maxkb=1000"]
      - id: check-case-conflict
      - id: check-merge-conflict
      - id: detect-private-key
```

### Credential Rotation Policy

```python
# ✅ Implement credential rotation
def rotate_api_key():
    """Rotate API keys regularly."""
    # 1. Generate new key
    new_key = generate_new_api_key()
    
    # 2. Update service to use new key
    update_environment_variable("API_KEY", new_key)
    
    # 3. Revoke old key after validity period
    old_key = os.getenv("API_KEY_OLD")
    if old_key:
        revoke_api_key(old_key)
    
    # 4. Log rotation event
    logger.info("API key rotated successfully")

# Schedule: Rotate keys every 90 days
# Use: APScheduler or cron jobs
```

---

## Authentication & Authorization

### JWT Best Practices (Python)

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from datetime import datetime, timedelta
import jwt
import os

app = FastAPI()
security = HTTPBearer()

JWT_SECRET = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# ✅ Generate JWT token
def create_access_token(user_id: str) -> str:
    """Create JWT token with expiration."""
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow(),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token

# ✅ Verify JWT token
async def verify_token(credentials: HTTPAuthCredentials = Depends(security)):
    """Verify JWT token from Authorization header."""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id"
            )
        
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# ✅ Use in endpoints
@app.get("/api/profile")
async def get_profile(user_id: str = Depends(verify_token)):
    """Get user profile - requires valid JWT."""
    return {"user_id": user_id, "name": "John Doe"}
```

### OAuth2 with Password Flow

```python
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
import bcrypt

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ✅ Hash passwords with bcrypt
def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

# ✅ Verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hash."""
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

# ✅ Login endpoint
@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """User login endpoint."""
    user = authenticate_user(form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    access_token = create_access_token(user.id)
    return {"access_token": access_token, "token_type": "bearer"}
```

### Authorization Checks

```python
# ✅ Resource-level authorization
@app.delete("/api/videos/{video_id}")
async def delete_video(video_id: str, user_id: str = Depends(verify_token)):
    """Delete video - verify user ownership."""
    video = get_video(video_id)
    
    # Check ownership
    if video.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this video"
        )
    
    delete_video_record(video_id)
    return {"message": "Video deleted"}

# ✅ Role-based access control
def verify_admin(user_id: str = Depends(verify_token)) -> dict:
    """Verify user is admin."""
    user = get_user(user_id)
    
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required"
        )
    
    return user

@app.get("/api/admin/users")
async def list_all_users(user: dict = Depends(verify_admin)):
    """Admin-only endpoint."""
    return get_all_users()
```

---

## Input Validation & Output Encoding

### Input Validation (Python)

```python
from pydantic import BaseModel, Field, validator, EmailStr
import re

# ✅ Use Pydantic for input validation
class VideoUploadRequest(BaseModel):
    """Validated video upload request."""
    
    filename: str = Field(..., min_length=1, max_length=255)
    file_size: int = Field(..., gt=0, le=500 * 1024 * 1024)  # Max 500MB
    language: str = Field(default="en", min_length=2, max_length=5)
    email: EmailStr  # Built-in email validation
    
    @validator("filename")
    def validate_filename(cls, value: str) -> str:
        """Validate filename format."""
        # Only allow alphanumeric, hyphens, underscores, dots
        if not re.match(r"^[a-zA-Z0-9._-]+$", value):
            raise ValueError("Filename contains invalid characters")
        
        # Check for path traversal attempts
        if ".." in value or "/" in value or "\\" in value:
            raise ValueError("Invalid filename")
        
        return value
    
    @validator("language")
    def validate_language(cls, value: str) -> str:
        """Validate language code."""
        allowed = ["en", "es", "fr", "de", "ja", "zh"]
        if value not in allowed:
            raise ValueError(f"Language must be one of {allowed}")
        return value.lower()

@app.post("/api/upload")
async def upload_video(request: VideoUploadRequest):
    """Upload video - input automatically validated by Pydantic."""
    # If we reach here, input is guaranteed valid
    return {"status": "uploaded"}
```

### SQL Injection Prevention (Python)

```python
from sqlalchemy import text
from sqlalchemy.orm import Session

# ❌ WRONG: String concatenation (vulnerable to SQL injection)
query = f"SELECT * FROM users WHERE id = {user_id}"
result = db.execute(query)

# ✅ CORRECT: Use parameterized queries
result = db.execute(
    text("SELECT * FROM users WHERE id = :user_id"),
    {"user_id": user_id}
)

# ✅ CORRECT: Use ORM (SQLAlchemy)
user = db.query(User).filter(User.id == user_id).first()

# ✅ CORRECT: Use prepared statements
query = db.query(User).filter_by(id=user_id)
user = query.first()
```

### XSS Prevention (JavaScript/React)

```javascript
import DOMPurify from "dompurify";

// ❌ WRONG: Directly render user input
function BadComponent({ userContent }) {
  return <div dangerouslySetInnerHTML={{ __html: userContent }} />;
}

// ✅ CORRECT: Sanitize HTML
function SafeComponent({ userContent }) {
  const sanitized = DOMPurify.sanitize(userContent);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// ✅ CORRECT: Use text content (no HTML)
function TextComponent({ userContent }) {
  return <div>{userContent}</div>;  // React escapes by default
}

// ✅ CORRECT: Sanitize attributes
function SafeLink({ userUrl, label }) {
  const sanitized = DOMPurify.sanitize(userUrl);
  return <a href={sanitized}>{label}</a>;
}
```

---

## API Security

### CORS Configuration

```python
# ✅ Restrict CORS to allowed origins
from fastapi.middleware.cors import CORSMiddleware
import os

allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Specific domains only
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=600,  # Cache preflight for 10 minutes
)

# ❌ WRONG: Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔴 DANGEROUS
)
```

### Rate Limiting

```python
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.util import get_remote_address

# ✅ Implement rate limiting
@app.post("/api/login")
@limiter.limit("5/minute")
async def login(request: Request, credentials: LoginRequest):
    """Limit login attempts to 5 per minute."""
    return authenticate(credentials)

@app.post("/api/upload")
@limiter.limit("10/hour")
async def upload_video(request: Request, file: UploadFile):
    """Limit uploads to 10 per hour."""
    return process_upload(file)
```

### API Key Management

```python
# ✅ Implement API key validation
from fastapi import Header, HTTPException

async def verify_api_key(x_api_key: str = Header(...)):
    """Verify API key from header."""
    valid_keys = get_valid_api_keys()  # From database
    
    if x_api_key not in valid_keys:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    return x_api_key

@app.get("/api/data")
async def get_data(api_key: str = Depends(verify_api_key)):
    """API endpoint with key verification."""
    return fetch_data()

# ✅ API Key rotation
def rotate_api_key(user_id: str):
    """Rotate API key for user."""
    old_key = get_user_api_key(user_id)
    new_key = generate_api_key()
    
    # Disable old key after grace period
    update_api_key(user_id, new_key, old_key_active_until=datetime.now() + timedelta(days=7))
    
    return new_key
```

---

## Dependency Security

### Python Dependency Scanning

```bash
# ✅ Scan for known vulnerabilities
pip install safety
safety check

# ✅ Use pip-audit (newer alternative)
pip install pip-audit
pip-audit

# ✅ Scan in requirements.txt for specific vulnerabilities
pip-audit --desc

# ✅ GitHub: Enable Dependabot
# Enable in Settings > Security & Analysis > Dependabot alerts
```

### JavaScript Dependency Scanning

```bash
# ✅ Audit npm dependencies
npm audit

# ✅ Fix vulnerabilities automatically
npm audit fix

# ✅ Fix with force (breaking changes possible)
npm audit fix --force

# ✅ Use Snyk for continuous scanning
npm install -g snyk
snyk test

# ✅ Check for outdated packages
npm outdated
```

### requirements.txt Best Practices

```
# ✅ Pin exact versions (production)
fastapi==0.115.0
sqlalchemy==2.0.23
google-cloud-speech==2.25.0
requests==2.31.0
bcrypt==4.1.0

# ❌ WRONG: Wildcard versions (unpredictable)
fastapi>=0.100.0
sqlalchemy>=2.0.0

# ✅ Use ranges for security patches only
cryptography>=42.0.0,<43.0.0  # Allow patch updates

# ✅ Group and comment dependencies
# Web Framework
fastapi==0.115.0
uvicorn==0.24.0

# Database
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
```

---

## Code Security

### SQL Injection Prevention

```python
# ✅ Use ORM to prevent SQL injection
from sqlalchemy import select

user = db.query(User).filter(User.email == user_email).first()

# ✅ Use raw SQL with parameterization
from sqlalchemy import text

result = db.execute(
    text("SELECT * FROM users WHERE id = :id"),
    {"id": user_id}
)

# ❌ WRONG: String formatting is vulnerable
user_id = request.query_params.get("id")
query = f"SELECT * FROM users WHERE id = {user_id}"  # 🔴 VULNERABLE
```

### Command Injection Prevention

```python
import subprocess
import shlex

# ❌ WRONG: Concatenating command strings
filename = user_input.filename
os.system(f"ffmpeg -i {filename} output.mp3")  # 🔴 VULNERABLE

# ✅ CORRECT: Use subprocess with list (no shell=True)
result = subprocess.run(
    ["ffmpeg", "-i", filename, "output.mp3"],
    capture_output=True,
    timeout=300,
    check=False
)

# ✅ Use shlex.quote for shell escaping when necessary
import shlex
safe_filename = shlex.quote(filename)
result = subprocess.run(
    f"ffmpeg -i {safe_filename} output.mp3",
    shell=True,
    capture_output=True
)
```

### CSRF Protection

```python
from fastapi.middleware.csrf import CSRFMiddleware

# ✅ Enable CSRF protection
app.add_middleware(
    CSRFMiddleware,
    secret_key=os.getenv("CSRF_SECRET_KEY"),
    cookie_secure=True,
    cookie_httponly=True,
    cookie_samesite="strict"
)

# ✅ Include CSRF token in forms (JavaScript)
async function submitForm(data) {
  const csrfToken = document.querySelector('[name="csrf_token"]').value;
  
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: {
      'X-CSRF-Token': csrfToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}
```

---

## Database Security

### Database Connection Security

```python
# ✅ Use SSL/TLS for database connections
import os
from sqlalchemy import create_engine

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "sslmode": "require",  # Require SSL
        "sslcert": "/path/to/cert.pem",
        "sslkey": "/path/to/key.pem",
    }
)

# ✅ Connection pooling with limits
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections
    pool_recycle=3600,   # Recycle connections hourly
)
```

### Least Privilege Database Users

```sql
-- ✅ Create limited database users
-- Read-only user for reports
CREATE USER readonly_user WITH PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;

-- Application user with minimal permissions
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT SELECT, INSERT, UPDATE ON users, videos TO app_user;
GRANT DELETE ON videos TO app_user;

-- Admin user (limited to deployments)
CREATE USER admin_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE mydb TO admin_user;
```

### Data Encryption

```python
from cryptography.fernet import Fernet
import os

# ✅ Encrypt sensitive data at rest
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
cipher_suite = Fernet(ENCRYPTION_KEY)

def encrypt_sensitive_data(data: str) -> str:
    """Encrypt sensitive information."""
    return cipher_suite.encrypt(data.encode()).decode()

def decrypt_sensitive_data(encrypted_data: str) -> str:
    """Decrypt sensitive information."""
    return cipher_suite.decrypt(encrypted_data.encode()).decode()

# Store encrypted
user.social_security_number = encrypt_sensitive_data(ssn)

# Use decrypted
actual_ssn = decrypt_sensitive_data(user.social_security_number)
```

---

## Security Testing

### OWASP Top 10 Checks

```python
# 1. Injection Flaws
# ✅ Use parameterized queries
# ✅ Input validation with Pydantic
# ✅ Avoid dynamic SQL

# 2. Broken Authentication
# ✅ Use strong password hashing (bcrypt)
# ✅ Implement JWT with expiration
# ✅ Enforce MFA for admin accounts

# 3. Sensitive Data Exposure
# ✅ Use HTTPS/TLS everywhere
# ✅ Encrypt sensitive data
# ✅ Don't log passwords or tokens

# 4. XML External Entities (XXE)
# ✅ Disable XML external entities
import xml.etree.ElementTree as ET
parser = ET.XMLParser(resolve_entities=False)
tree = ET.parse(file, parser)

# 5. Broken Access Control
# ✅ Check user permissions on every action
# ✅ Implement RBAC (Role-Based Access Control)
# ✅ Verify resource ownership

# 6. Security Misconfiguration
# ✅ Use security headers
# ✅ Disable debug mode in production
# ✅ Keep dependencies updated

# 7. XSS
# ✅ Sanitize output (DOMPurify)
# ✅ Use Content Security Policy headers
# ✅ Escape user input

# 8. Insecure Deserialization
# ✅ Never pickle untrusted data
# ✅ Use JSON for serialization
# ✅ Validate schema

# 9. Using Components with Known Vulnerabilities
# ✅ Run updates regularly
# ✅ Use vulnerability scanning
# ✅ Monitor security advisories

# 10. Insufficient Logging & Monitoring
# ✅ Log security events
# ✅ Monitor for suspicious activity
# ✅ Set up alerts
```

### Security Testing Tools

```bash
# Python security scanning
pip install bandit
bandit -r backend/

# JavaScript security scanning
npm install snyk -g
snyk test

# OWASP dependency check
docker run owasp/dependency-check --scan .

# Code quality + security
pip install pylint
pylint backend/

# Static analysis
pip install pylint-flask
```

---

## GitHub & Repository Security

### .gitignore: Prevent Secrets Leaks

```bash
# ✅ backend/.gitignore
.env
.env.local
.env.*.local
.env.*.txt

# Secrets
secrets/
credentials/
private_keys/
*.pem
*.key
*.pfx
*.p12

# API Keys storage
config/secrets.json
config/credentials.json
.aws/credentials
.gcp/credentials

# IDE secrets
.idea/
.vscode/settings.json

# Temporary files that might contain secrets
temp/
tmp/
*.tmp

# Build outputs
dist/
build/
__pycache__/
*.egg-info/

# Testing
.pytest_cache/
coverage/
.coverage
```

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  # Detect secrets
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ["--allow-multiple-files"]
        exclude: "^tests/"

  # Detect private keys
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: detect-private-key
      - id: check-added-large-files
        args: ["--maxkb=1000"]
      - id: check-case-conflict
      - id: check-merge-conflict

  # Python security
  - repo: https://github.com/PyCQA/bandit
    rev: 1.7.5
    hooks:
      - id: bandit
        args: ["-c", ".bandit"]

  # Code formatting
  - repo: https://github.com/psf/black
    rev: 23.12.0
    hooks:
      - id: black

  # Import sorting
  - repo: https://github.com/PyCQA/isort
    rev: 5.13.2
    hooks:
      - id: isort
```

### Branch Protection Rules

```yaml
# GitHub Settings > Branches > Add rule
branch_protection:
  - Require pull request reviews: 1 minimum
  - Require status checks to pass: 
    - Security scan (bandit)
    - Dependency check (safety/pip-audit)
    - Linting (eslint/pylint)
    - Tests (pytest/vitest)
  - Require branches to be up to date
  - Restrict who can push to matching branches
  - Require signed commits: true
  - Dismiss stale pull request approvals
  - Require approval of reviewers
```

### Commit Signing

```bash
# ✅ Setup GPG signing
gpg --gen-key

# ✅ Add to git config
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgSign true

# ✅ Sign commits
git commit -S -m "Your commit message"

# ✅ Verify signatures
git log --show-signature

# ✅ GitHub: Require signed commits in branch protection rules
```

### GitHub Actions Security

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      # Detect secrets
      - uses: Yelp/detect-secrets-action@v1
        with:
          baseline: .secrets.baseline

      # Check for hardcoded credentials
      - uses: pre-commit/action@v3

      # Python security
      - name: Run Bandit
        run: |
          pip install bandit
          bandit -r backend/

      # Dependency scanning
      - name: Check dependencies
        run: |
          pip install safety
          safety check

      # SAST scanning
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Handling Accidentally Committed Secrets

```bash
# ⚠️ If a secret is committed to GitHub:

# 1. Immediately revoke the secret (API key, password, token)
# 2. Force push to remove from history (if private repo)
git filter-branch --tree-filter 'rm -f path/to/secret_file' HEAD
git push origin --force

# 3. Or use BFG Repo Cleaner (safer)
bfg --delete-files secret_file.txt
git refactor

# 4. For public repos, assume compromise:
#    - Revoke the key immediately
#    - Rotate all credentials
#    - Scan for unauthorized access
#    - Notify affected users

# 5. Monitor with GitHub's security alerts
# Settings > Security & Analysis > Enabling:
#   - Dependabot alerts
#   - Dependabot security updates
#   - Secret scanning
#   - Secret scanning push protection
```

---

## Infrastructure Security

### HTTPS & TLS

```python
# ✅ Redirect HTTP to HTTPS
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

app.add_middleware(HTTPSRedirectMiddleware)

# ✅ Set security headers
from fastapi.middleware import Middleware

app = FastAPI(
    middleware=[
        Middleware(
            TrustedHostMiddleware,
            allowed_hosts=["example.com", "*.example.com"]
        ),
    ]
)

# ✅ Use HSTS header
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

### Environment Parity

```bash
# ✅ Use same versions across environments
production:
  Python: 3.11.0
  PostgreSQL: 15.1
  Node.js: 20.0.0

staging:
  Python: 3.11.0
  PostgreSQL: 15.1
  Node.js: 20.0.0

development:
  Python: 3.11.0
  PostgreSQL: 15.1
  Node.js: 20.0.0
```

---

## Incident Response & Incident Handling

### Security Incident Response Plan

```markdown
# Incident Response Procedure

## 1. Detection
- Monitor logs for suspicious activity
- Set up alerts for:
  - Multiple failed login attempts
  - Unauthorized API calls
  - Database access anomalies
  - Large data exports

## 2. Containment
- Revoke compromised credentials immediately
- Disable affected accounts
- Isolate affected systems
- Stop malicious processes

## 3. Investigation
- Review logs and audit trails
- Determine scope of breach
- Identify what data was accessed
- Document timeline

## 4. Eradication
- Remove malware/backdoors
- Reset passwords for affected accounts
- Update security configurations
- Deploy patches

## 5. Recovery
- Restore from clean backups
- Verify systems integrity
- Monitor for re-infection
- Restore service

## 6. Post-Incident
- Notification: Affected users within 72 hours
- Root cause analysis
- Process improvements
- Security awareness training
```

### Logging & Monitoring

```python
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# ✅ Log security events
def log_security_event(event_type: str, user_id: str, details: dict):
    """Log security events for audit trail."""
    logger.warning(f"SECURITY_EVENT: {event_type}", extra={
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "event_type": event_type,
        "details": details,
        "ip_address": get_client_ip(),
    })

# Examples
log_security_event("LOGIN_FAILED", user_id, {"attempts": 3})
log_security_event("UNAUTHORIZED_ACCESS", user_id, {"resource": "admin_panel"})
log_security_event("DATA_EXPORT", user_id, {"records": 10000})
```

---

## Security Checklist

### Before Every Commit

- [ ] No secrets in code (API keys, passwords, tokens)
- [ ] No hardcoded credentials
- [ ] Environment variables used for all sensitive data
- [ ] .env file is in .gitignore
- [ ] Pre-commit hooks enabled
- [ ] No large files (>1MB) committed
- [ ] No merge conflicts in code
- [ ] All tests passing
- [ ] No console logging of sensitive data

### Before Every Merge

- [ ] Security code review completed
- [ ] Input validation present
- [ ] Output encoding present
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Authentication checks in place
- [ ] Authorization checks verified
- [ ] Error messages don't expose internals
- [ ] Dependencies scanned for vulnerabilities
- [ ] Security tests included

### Before Every Deployment

- [ ] Review environment variables
- [ ] Verify secrets are set correctly
- [ ] Database migrations reviewed
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting configured
- [ ] Logging enabled
- [ ] Monitoring alerts setup
- [ ] Backups tested
- [ ] Rollback plan documented
- [ ] Security scan completed (bandit, safety, npm audit)

### Regularly (Weekly/Monthly)

- [ ] Review access logs
- [ ] Check for unusual activity
- [ ] Update dependencies
- [ ] Rotate API keys (every 90 days)
- [ ] Review security alerts
- [ ] Test disaster recovery
- [ ] Security training/awareness
- [ ] Audit user permissions
- [ ] Review open source licenses

---

## Summary of Key Principles

1. **Never Trust User Input**: Always validate and sanitize
2. **Use HTTPS Everywhere**: Encrypt data in transit
3. **Encrypt Sensitive Data**: Both at rest and in transit
4. **Keep Dependencies Updated**: Regular patching is critical
5. **Implement Logging & Monitoring**: Detect issues early
6. **Follow Least Privilege**: Users/services get minimum needed access
7. **Secure by Default**: Security should be the default, not optional
8. **Assume Breach**: Design systems to handle compromises gracefully

---

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CWE: Common Weakness Enumeration](https://cwe.mitre.org/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

---

**Last Updated**: April 2026  
**Version**: 1.0  
**Status**: Active  
**Reviewed By**: Security Team
