# Documentation Standards

## Table of Contents
1. [README Structure](#readme-structure)
2. [API Documentation](#api-documentation)
3. [Code Examples](#code-examples)
4. [Architecture Decision Records](#architecture-decision-records)
5. [Setup & Installation](#setup--installation)
6. [Contributing Guidelines](#contributing-guidelines)
7. [Runbooks & Operations](#runbooks--operations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Changelog](#changelog)
10. [Documentation Tools](#documentation-tools)

---

## README Structure

### Root README.md Template

```markdown
# Video Analytics Platform

One paragraph explaining what the project does and why it matters.

## Features

- Feature 1: Description
- Feature 2: Description
- Feature 3: Description

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/yourorg/video-analytics.git
cd video-analytics

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -m pytest  # Verify setup

# Frontend setup
cd ../frontend
npm install
npm run dev
```

### Running the Application

```bash
# Terminal 1: Start backend
cd backend
python main.py

# Terminal 2: Start frontend
cd frontend
npm run dev

# Visit http://localhost:3000
```

## API Documentation

API docs available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

See [API Documentation](./STANDARDS/001_API_DESIGN_STANDARDS.md)

## Project Structure

```
project/
├── backend/          # Python FastAPI backend
├── frontend/         # React frontend
├── STANDARDS/        # Coding standards
└── docs/            # Additional documentation
```

## Contributing

Read [Contributing Guide](CONTRIBUTING.md) for:
- Code standards
- Testing requirements
- Pull request process
- Commit message format

## License

[License Type] - See LICENSE file

## Support

- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Email: support@example.com
```

---

## API Documentation

### OpenAPI/Swagger Setup

```python
# main.py
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI(
    title="Video Analytics API",
    description="API for video analysis, transcription, and insights",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Video Analytics API",
        version="1.0.0",
        description="Complete API documentation",
        routes=app.routes
    )
    
    openapi_schema["info"]["x-logo"] = {
        "url": "https://example.com/logo.png"
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
```

### Endpoint Documentation

```python
@app.post(
    "/api/v1/videos",
    response_model=VideoResponse,
    status_code=201,
    tags=["Videos"],
    summary="Upload new video",
    description="Upload a video file and initiate processing"
)
async def upload_video(
    file: UploadFile = File(...),
    title: str = Query(..., description="Video title", min_length=1),
) -> VideoResponse:
    """
    Upload a video for analysis.
    
    Accepts MP4, WebM, and AVI formats up to 500MB.
    Triggers automatic transcription and analysis.
    
    Query Parameters:
    - title: Name of the video
    - language: Language code (e.g., 'en-US')
    
    Response:
    - id: Unique video identifier
    - status: 'processing' initially
    - created_at: Timestamp of upload
    
    Raises:
    - 400: Invalid file format or title
    - 413: File too large
    - 429: Upload limit exceeded
    
    Examples:
    ```bash
    curl -X POST http://localhost:8000/api/v1/videos \
      -F "file=@video.mp4" \
      -F "title=My Video"
    ```
    """
    pass
```

---

## Code Examples

### Tutorial Structure

```markdown
# Uploading and Analyzing Videos

This tutorial walks through uploading a video and retrieving analysis results.

## Prerequisites
- API key from admin dashboard
- cURL or Python requests library

## Step 1: Authenticate

```bash
curl -X POST http://localhost:8000/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

## Step 2: Upload Video

```bash
curl -X POST http://localhost:8000/api/v1/videos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@video.mp4" \
  -F "title=My Video"
```

## Step 3: Check Status

```bash
curl http://localhost:8000/api/v1/videos/VIDEO_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Wait for `status` to be `completed`.

## Step 4: Get Analysis

```bash
curl http://localhost:8000/api/v1/videos/VIDEO_ID/analysis \
  -H "Authorization: Bearer YOUR_TOKEN"
```
```

---

## Architecture Decision Records

### ADR Template

```markdown
# ADR-001: Use FastAPI for REST API

## Status
ACCEPTED (2026-04-01)

## Context
We need a web framework for our REST API that:
- Handles async operations (video processing)
- Integrates with async/await pattern
- Has excellent documentation
- Provides automatic API documentation
- Has strong community support

## Decision
Use FastAPI for the REST API backend.

## Consequences

### Positive
- Automatic OpenAPI/Swagger documentation
- Built-in data validation with Pydantic
- Excellent async/await support
- High performance
- Easy to test

### Negative
- Smaller community than Flask/Django
- Less mature than Django
- Fewer third-party extensions

## Alternatives Considered
- Django: Too heavyweight for this project
- Flask: No built-in async support
- Quart: Less documentation than FastAPI

## Related ADRs
- ADR-002: Use PostgreSQL for database

## References
- https://fastapi.tiangolo.com/
- Performance comparisons
```

---

## Setup & Installation

### Backend Setup Guide

```markdown
# Backend Setup Guide

## Prerequisites
- Python 3.11 or higher
- pip package manager
- PostgreSQL 15
- Git

## Installation Steps

### 1. Clone Repository
```bash
git clone https://github.com/yourorg/video-analytics.git
cd video-analytics/backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv

# Activate
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings:
# - DATABASE_URL
# - GOOGLE_API_KEY
# - JWT_SECRET_KEY
```

### 5. Initialize Database
```bash
alembic upgrade head
```

### 6. Run Tests
```bash
pytest --cov=backend
```

### 7. Start Server
```bash
python main.py
```

Server runs at http://localhost:8000
```

---

## Contributing Guidelines

### CONTRIBUTING.md Template

```markdown
# Contributing Guide

## Code of Conduct
Please read and follow our Code of Conduct.

## Getting Started

### Fork and Clone
```bash
git clone https://github.com/yourorg/video-analytics.git
```

### Create Feature Branch
```bash
git checkout -b feature/my-feature
```

### Make Changes
1. Follow [Coding Standards](../PYTHON_CODING_STANDARDS.md)
2. Write tests for new code
3. Update documentation

### Commit Changes
```bash
git commit -m "feat: add new feature description"
```

Follow [Conventional Commits](https://www.conventionalcommits.org/)

### Push and Create PR
```bash
git push origin feature/my-feature
```

Create Pull Request on GitHub. Include:
- Description of changes
- Related issue number
- Testing performed

## Review Process
1. Automated checks must pass
2. Code review from maintainers
3. Approval from at least 1 reviewer
4. Squash and merge

## Questions?
Create an issue or contact us.
```

---

## Runbooks & Operations

### Operational Runbooks

```markdown
# Runbook: Handle High Error Rate

## Symptoms
- Error rate > 5% for > 1 minute
- Alert triggered by monitoring system

## Immediate Actions (5 minutes)
1. Check dashboard: http://monitoring.example.com
2. Identify error pattern (which endpoints/services?)
3. Check recent deployments
4. Check database health

## Investigation Steps
1. Look at logs:
```bash
kubectl logs -f deployment/api -n production --tail=100
```

2. Check services:
```bash
kubectl get services -n production
```

3. Check database:
```bash
psql -h db.example.com -U admin -d videoanalytics
SELECT * FROM pg_stat_statements ORDER BY mean_time DESC;
```

## Resolution Options

### Option 1: Rollback
If caused by recent deployment:
```bash
./scripts/rollback-production.sh [PREVIOUS_VERSION]
```

### Option 2: Scale Up
If high load:
```bash
kubectl scale deployment/api --replicas=5 -n production
```

### Option 3: Restart Service
If stuck processes:
```bash
kubectl rolling-restart deployment/api -n production
```

## Post-Incident
1. Document root cause
2. Create follow-up issue
3. Update monitoring/alerting
```

---

## Troubleshooting Guide

```markdown
# Troubleshooting

## Video Upload Fails

### Error: "413 Payload Too Large"
**Cause**: File exceeds 500MB limit
**Solution**: Split video into smaller chunks or compress

### Error: "415 Unsupported Media Type"
**Cause**: Unsupported file format
**Solution**: Convert to MP4 with ffmpeg:
```bash
ffmpeg -i input.avi -c:v libx264 -c:a aac output.mp4
```

## Transcription Not Starting

### Check Queue Status
```bash
curl http://localhost:8000/api/v1/jobs?status=pending
```

### Restart Queue Worker
```bash
kubectl rollout restart deployment/transcription-worker -n production
```

## Database Connection Issues

### Check Connection String
```bash
python -c "from main import db; db.connect()"
```

### Verify PostgreSQL is Running
```bash
pg_isready -h localhost -p 5432
```
```

---

## Changelog

### CHANGELOG.md Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-04-06

### Added
- Sentiment analysis for transcribed text
- Batch video upload API endpoint
- Support for Arabic language transcription

### Changed
- Improved transcription accuracy (95% → 97%)
- Optimized video processing pipeline (10% faster)
- Updated API response format to include metadata

### Fixed
- Memory leak in audio buffering (fixes #1234)
- Race condition in concurrent uploads
- SSL certificate validation error

### Deprecated
- old_api_endpoint (use new_api_endpoint instead)

### Security
- Fixed potential SQL injection in filters
- Updated bcrypt to 4.1.0 (security patch)

## [1.1.0] - 2026-03-15

### Added
- Dark mode support
- Export results to CSV

...
```

---

## Documentation Tools

### Recommended Tools

```
API Documentation:
- Swagger/OpenAPI
- ReDoc
- Postman collections

Code Documentation:
- Docstrings (Google/NumPy format)
- Type hints

Architecture:
- Mermaid diagrams
- Draw.io
- PlantUML

Hosting:
- GitHub Pages (free)
- Cloudflare Pages
- Netlify
- ReadTheDocs (Python projects)
```

---

**Last Updated**: April 2026  
**Version**: 1.0  
**Status**: Active
