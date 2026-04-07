# Configuration Management Gold Standards

## Table of Contents
1. [Configuration Philosophy](#configuration-philosophy)
2. [Environment-Based Config](#environment-based-config)
3. [Environment Variables (.env)](#environment-variables-env)
4. [Configuration Files](#configuration-files)
5. [Secrets Management](#secrets-management)
6. [Multi-Environment Setup](#multi-environment-setup)
7. [Feature Flags & Settings](#feature-flags--settings)
8. [Database Configuration](#database-configuration)
9. [Third-Party Service Config](#third-party-service-config)
10. [Configuration Validation](#configuration-validation)

---

## Configuration Philosophy

### Core Principle: 12-Factor App

**Configuration should be:**
1. Environment-specific (dev, staging, prod differ)
2. Easy to change without code changes
3. NOT committed to version control (especially secrets)
4. Validated at startup
5. Documented clearly

```python
# ✅ Configuration-driven
API_KEY = os.getenv("OPENAI_API_KEY")  # From env
DATABASE_URL = os.getenv("DATABASE_URL")  # From env
DEBUG = os.getenv("DEBUG", "false").lower() == "true"  # Default provided

# ❌ Hardcoded (NEVER this)
API_KEY = "sk-1234567890..."  # DON'T DO THIS
DATABASE_URL = "postgresql://prod-db.example.com/..."  # DON'T DO THIS
```

### Secrets vs Configuration

| Type | Storage | Tools | Example |
|------|---------|-------|---------|
| **Secrets** | .env, Vault, cloud secret manager | Never version controlled | API keys, passwords |
| **Configuration** | .env, config files, environment | Version controlled (non-sensitive) | Feature flags, log levels |

---

## Environment-Based Config

### Three Core Environments

```text
DEVELOPMENT
├─ Local machine
├─ Loose constraints
├─ Maximum logging
└─ Can use test/fake services

STAGING
├─ Production-like setup
├─ Real services (non-prod DBs)
├─ All security checks enabled
└─ Mirrors production configuration

PRODUCTION
├─ Live environment
├─ Strict error handling
├─ Minimal logging (privacy)
└─ All monitoring enabled
```

### Environment-Specific Code

```python
# ✅ Good: Environment-specific logic
from enum import Enum

class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"

ENV = Environment(os.getenv("ENVIRONMENT", "development"))

# Use environment to control behavior
if ENV == Environment.PRODUCTION:
    LOG_LEVEL = "INFO"  # Less verbose
    DEBUG = False
    SENTRY_ENABLED = True  # Error tracking
else:
    LOG_LEVEL = "DEBUG"  # Verbose
    DEBUG = True
    SENTRY_ENABLED = False
```

---

## Environment Variables (.env)

### .env File Structure

```bash
# backend/.env (Development - use defaults)
ENVIRONMENT=development
DEBUG=true

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=video_analytics_dev
POSTGRES_USER=dev

OPENAI_API_KEY=sk-test-1234567890  # Test key/mock in dev
GOOGLE_API_KEY=test-key-123

# Redis
REDIS_URL=redis://localhost:6379

# Email (use test provider in dev)
SMTP_HOST=mailhog
SMTP_PORT=1025

# Logging
LOG_LEVEL=DEBUG
```

### .env.example (Tracked in Git)

```bash
# backend/.env.example
# Copy this to .env and fill in your values
# DO NOT commit .env to git

ENVIRONMENT=development
DEBUG=true

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=video_analytics_dev
POSTGRES_USER=dev
POSTGRES_PASSWORD=password

OPENAI_API_KEY=sk-your-key-here
GOOGLE_API_KEY=your-key-here

REDIS_URL=redis://localhost:6379

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

LOG_LEVEL=DEBUG
```

### Loading .env in Python

```python
# backend/config/settings.py
from pydantic import BaseSettings
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

class Settings(BaseSettings):
    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Database
    postgres_host: str = os.getenv("POSTGRES_HOST", "localhost")
    postgres_port: int = int(os.getenv("POSTGRES_PORT", "5432"))
    postgres_db: str = os.getenv("POSTGRES_DB", "video_analytics")
    postgres_user: str = os.getenv("POSTGRES_USER", "postgres")
    postgres_password: str = os.getenv("POSTGRES_PASSWORD", "")
    
    # API Keys
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    google_api_key: str = os.getenv("GOOGLE_API_KEY", "")
    
    # Redis
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
```

### Loading .env in JavaScript

```javascript
// frontend/.env
VITE_API_BASE_URL=http://localhost:8000
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

// frontend/.env.production
VITE_API_BASE_URL=https://api.example.com
VITE_GOOGLE_ANALYTICS_ID=G-PROD-ID

// frontend/src/config.js
const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  analytics: {
    googleId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
  },
};

export default config;
```

---

## Configuration Files

### YAML Configuration

```yaml
# backend/config.yaml (for complex configs)
app:
  name: llm-video-analytics
  version: 1.0.0
  debug: ${DEBUG:false}

database:
  postgresql:
    host: ${POSTGRES_HOST:localhost}
    port: ${POSTGRES_PORT:5432}
    database: ${POSTGRES_DB:video_analytics}
    user: ${POSTGRES_USER:postgres}
    password: ${POSTGRES_PASSWORD}
    pool_size: ${DB_POOL_SIZE:10}
    
logging:
  level: ${LOG_LEVEL:INFO}
  format: json  # Structured logging
  outputs:
    - console
    - file: logs/app.log

services:
  openai:
    api_key: ${OPENAI_API_KEY}
    model: gpt-4
    timeout: 30
  
  google:
    api_key: ${GOOGLE_API_KEY}
    timeout: 30
```

### Load YAML Config

```python
# backend/config/loader.py
import yaml
from pathlib import Path
from typing import Dict, Any
import os

def load_config(env: str) -> Dict[str, Any]:
    """Load config with environment interpolation."""
    config_path = Path(__file__).parent / f"config.yaml"
    
    with open(config_path) as f:
        raw_config = yaml.safe_load(f)
    
    # Interpolate environment variables
    config = _interpolate_env(raw_config)
    return config

def _interpolate_env(obj: Any) -> Any:
    """Recursively interpolate ${VAR:default} patterns."""
    if isinstance(obj, str):
        # Replace ${VAR:default} with env value or default
        import re
        def replace(match):
            var_name = match.group(1)
            default = match.group(2) or ""
            return os.getenv(var_name, default)
        
        return re.sub(r'\$\{([^:}]+)(?::([^}]+))?\}', replace, obj)
    elif isinstance(obj, dict):
        return {k: _interpolate_env(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_interpolate_env(item) for item in obj]
    else:
        return obj
```

---

## Secrets Management

### Secret Hierarchy (Most Secret → Least)

1. **Cloud Secret Manager** (Production)
   - AWS Secrets Manager, GCP Secret Manager, Azure Key Vault
   - Never touch local machine
   - Rotated automatically
   - Audit logged

2. **.env File** (Development/Staging)
   - Not committed to git
   - Used with `python-dotenv`
   - Shared securely (1Password, LastPass, etc.)

3. **Environment Variables** (CI/CD)
   - GitHub Actions secrets
   - GitLab CI variables
   - Managed per environment

### Accessing Secrets

```python
# ✅ Load from cloud in production
import boto3
from botocore.exceptions import ClientError

def get_secret(secret_name: str) -> str:
    """Fetch secret from AWS Secrets Manager (production)."""
    client = boto3.client('secretsmanager')
    
    try:
        response = client.get_secret_value(SecretId=secret_name)
        return response['SecretString']
    except ClientError as e:
        raise RuntimeError(f"Cannot retrieve secret {secret_name}: {e}")

# ✅ Or use environment variable
class Settings:
    openai_api_key: str = os.getenv("OPENAI_API_KEY")
    
    def __init__(self):
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY environment variable not set")

settings = Settings()
```

---

## Multi-Environment Setup

### Example: Development → Staging → Production

```bash
# development/.env
ENVIRONMENT=development
DEBUG=true
DATABASE_URL=postgresql://dev:dev@localhost:5432/video_analytics_dev
OPENAI_API_KEY=sk-test-...
LOG_LEVEL=DEBUG

# staging/.env (on CI/CD server)
ENVIRONMENT=staging
DEBUG=false
DATABASE_URL=${STAGING_DB_URL}  # From CI secret
OPENAI_API_KEY=${STAGING_OPENAI_KEY}  # From CI secret
LOG_LEVEL=INFO

# production/.env (on production server)
ENVIRONMENT=production
DEBUG=false
DATABASE_URL=${PROD_DB_URL}  # From cloud secrets manager
OPENAI_API_KEY=${PROD_OPENAI_KEY}  # From cloud secrets manager
LOG_LEVEL=WARNING
```

### Environment-Specific Behavior

```python
# ✅ Different logic per environment
from enum import Enum

class Environment(str, Enum):
    DEV = "development"
    STAGING = "staging"
    PROD = "production"

ENV = Environment(os.getenv("ENVIRONMENT", "development"))

# Feature flags
FEATURES = {
    "new_analysis_algorithm": ENV in (Environment.DEV, Environment.STAGING),
    "payment_processing": ENV == Environment.PROD,
    "detailed_logging": ENV != Environment.PROD,
}

if FEATURES["detailed_logging"]:
    LOG_LEVEL = "DEBUG"
else:
    LOG_LEVEL = "WARNING"
```

---

## Feature Flags & Settings

### Simple Feature Flags

```python
# backend/config/features.py
from enum import Enum
import os

class Environment(str, Enum):
    DEV = "development"
    STAGING = "staging"
    PROD = "production"

ENV = Environment(os.getenv("ENVIRONMENT", "development"))

# Feature flags: enable/disable features per environment
FEATURES = {
    "transcription_v2": ENV in (Environment.STAGING, Environment.PROD),
    "translation_enabled": ENV != Environment.DEV,
    "analytics_tracking": ENV == Environment.PROD,
    "beta_ui": os.getenv("BETA_UI", "false").lower() == "true",
}

# Usage
if FEATURES["transcription_v2"]:
    analyzer = TranscriptionV2()
else:
    analyzer = TranscriptionV1()
```

### Runtime Configuration

```python
# ✅ Settings endpoint for frontend
@app.get("/api/config")
def get_config(current_user: User = Depends(get_current_user)):
    """Public config endpoint (no secrets!)."""
    return {
        "environment": os.getenv("ENVIRONMENT"),
        "apiVersion": "1.0.0",
        "features": {
            "analyticsEnabled": FEATURES["analytics_tracking"],
            "betaUIEnabled": FEATURES["beta_ui"],
        },
    }
```

---

## Database Configuration

```python
# ✅ Database URL from environment
from sqlalchemy import create_engine

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost:5432/dbname"
)

# Validate URL format
if not DATABASE_URL.startswith(('postgresql://', 'mysql://')):
    raise ValueError(f"Invalid DATABASE_URL: {DATABASE_URL}")

engine = create_engine(
    DATABASE_URL,
    pool_size=int(os.getenv("DB_POOL_SIZE", "10")),
    max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "20")),
    pool_pre_ping=True,  # Verify connections before reusing
)
```

---

## Third-Party Service Config

```python
# ✅ Typed service configurations
from typing import Optional

class OpenAIConfig:
    api_key: str = os.getenv("OPENAI_API_KEY", "")
    model: str = os.getenv("OPENAI_MODEL", "gpt-4")
    timeout: int = int(os.getenv("OPENAI_TIMEOUT", "30"))
    max_retries: int = int(os.getenv("OPENAI_MAX_RETRIES", "3"))
    
    def __init__(self):
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not set")

class GoogleCloudConfig:
    project_id: str = os.getenv("GCP_PROJECT_ID", "")
    api_key: str = os.getenv("GOOGLE_API_KEY", "")
    
    def __init__(self):
        if not self.project_id:
            raise ValueError("GCP_PROJECT_ID not set")

openai_config = OpenAIConfig()
gcp_config = GoogleCloudConfig()
```

---

## Configuration Validation

### Startup Validation

```python
# ✅ Validate config on app startup
from pydantic import BaseSettings, validator

class Settings(BaseSettings):
    environment: str
    debug: bool
    database_url: str
    openai_api_key: str
    
    @validator("database_url")
    def validate_database_url(cls, v: str) -> str:
        if not v.startswith(('postgresql://', 'mysql://')):
            raise ValueError("Invalid DATABASE_URL")
        return v
    
    @validator("openai_api_key")
    def validate_api_key(cls, v: str) -> str:
        if not v:
            raise ValueError("OPENAI_API_KEY not set")
        if len(v) < 20:
            raise ValueError("OPENAI_API_KEY looks invalid (too short)")
        return v

# This will raise on instantiation if config invalid
try:
    settings = Settings()
except Exception as e:
    print(f"Configuration error: {e}")
    sys.exit(1)
```

### Configuration Documentation

```markdown
# Configuration Guide

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key

### Optional
- `LOG_LEVEL`: Log level (DEBUG, INFO, WARNING, ERROR) - default INFO
- `REDIS_URL`: Redis URL - default redis://localhost:6379

## Example

See `.env.example` for a template.

```bash
cp .env.example .env
# Edit .env with your values
```

## Validation

Config is validated on app startup. If you see errors, check:
1. All required variables are set
2. Database URL format is correct
3. API keys are valid
```

---

## Related Standards
- [000_SECURITY_CODING_STANDARDS.md](000_SECURITY_CODING_STANDARDS.md)
- [004_DEPLOYMENT_CICD_STANDARDS.md](004_DEPLOYMENT_CICD_STANDARDS.md)
- [011_PYTHON_CODING_STANDARDS.md](011_PYTHON_CODING_STANDARDS.md)

---

**Last Updated:** April 2026
**Status:** Gold Standard
