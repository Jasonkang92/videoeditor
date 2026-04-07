# Python Coding Gold Standards

## Table of Contents
1. [Code Style & Formatting](#code-style--formatting)
2. [Naming Conventions](#naming-conventions)
3. [Documentation & Comments](#documentation--comments)
4. [Project Structure](#project-structure)
5. [Error Handling](#error-handling)
6. [Security Best Practices](#security-best-practices)
7. [Testing](#testing)
8. [Performance Optimization](#performance-optimization)
9. [API & Backend Patterns](#api--backend-patterns)
10. [Dependency Management](#dependency-management)
11. [Git & Version Control](#git--version-control)

---

## Code Style & Formatting

### PEP 8 Compliance
- **Line Length**: Maximum 88 characters (Black formatter standard)
- **Indentation**: 4 spaces per level (never tabs)
- **Blank Lines**: 
  - 2 blank lines between top-level functions/classes
  - 1 blank line between methods
  - Use judiciously within functions for logical separation

### Formatting Tools
```bash
# Format code with Black
black backend/ --line-length 88

# Lint with Pylint or Flake8
flake8 backend/ --max-line-length=88

# Sort imports with isort
isort backend/
```

### Line Breaking
```python
# ❌ Bad: Line too long
def process_video_analytics(file_path, analysis_type, language_code, include_timestamps=True):
    pass

# ✅ Good: Proper line breaking
def process_video_analytics(
    file_path: str,
    analysis_type: str,
    language_code: str,
    include_timestamps: bool = True
) -> dict:
    pass
```

### Imports
```python
# ✅ Order: stdlib, third-party, local
import os
import sys
from typing import Optional, List, Dict

import fastapi
from google.cloud import storage

from auth import authenticate_user
from models import VideoAnalysis
```

---

## Naming Conventions

### Variables & Constants
```python
# ❌ Bad
videoFile = "path/to/file"
MAXSIZE = 1024
v = get_data()

# ✅ Good
video_file = "path/to/file"
MAX_FILE_SIZE = 1024
video_data = get_data()
```

### Functions & Methods
```python
# ✅ Use lowercase with underscores
def extract_audio_from_video(video_path: str) -> bytes:
    """Extract audio stream from video file."""
    pass

def _internal_helper_function():
    """Private methods start with single underscore."""
    pass

def __dunder_protocol_method__():
    """Dunder methods for special Python behavior."""
    pass
```

### Classes
```python
# ✅ Use PascalCase
class VideoAnalyzer:
    """Primary class for video analysis operations."""
    pass

class HTTPAuthenticationError(Exception):
    """Custom exceptions inherit from base Exception."""
    pass
```

### Constants
```python
# ✅ Use UPPER_SNAKE_CASE at module level
DEFAULT_LANGUAGE = "en"
MAX_VIDEO_DURATION_SECONDS = 3600
SUPPORTED_VIDEO_FORMATS = ("mp4", "webm", "avi")
API_TIMEOUT = 30
```

---

## Documentation & Comments

### Docstrings
Use Google-style docstrings for all public functions, classes, and methods:

```python
def transcribe_audio(
    audio_file: bytes,
    language_code: str = "en-US",
    enable_timestamps: bool = False
) -> Dict[str, any]:
    """Transcribe audio content to text using Speech-to-Text API.
    
    Supports multiple audio formats (WAV, MP3, OGG, FLAC) and 
    languages via Google Cloud Speech-to-Text service.
    
    Args:
        audio_file: Raw audio bytes to transcribe.
        language_code: BCP-47 language code (e.g., 'en-US', 'es-ES').
        enable_timestamps: If True, return word-level timestamps.
    
    Returns:
        Dictionary containing:
            - 'transcript': Full transcription text
            - 'confidence': Confidence score (0.0-1.0)
            - 'timestamps': List of word/timestamp tuples if enabled
            - 'language': Detected language code
    
    Raises:
        ValueError: If audio_file is empty or language_code invalid.
        APIError: If Speech-to-Text API request fails.
        TimeoutError: If request exceeds timeout threshold.
    
    Examples:
        >>> audio = open('sample.wav', 'rb').read()
        >>> result = transcribe_audio(audio, language_code='en-US')
        >>> print(result['transcript'])
    """
    pass

class VideoProcessor:
    """Process video files for analytics and transcription.
    
    Handles extraction of audio, frames, and metadata from video files
    using FFmpeg and Google Cloud services.
    
    Attributes:
        max_duration: Maximum allowed video duration in seconds.
        supported_formats: Tuple of supported video file extensions.
    
    Example:
        processor = VideoProcessor(max_duration=3600)
        audio = processor.extract_audio('video.mp4')
    """
    
    def __init__(self, max_duration: int = 3600):
        """Initialize VideoProcessor."""
        self.max_duration = max_duration
```

### Code Comments
```python
# ✅ Comments explain WHY, not WHAT
def calculate_confidence_score(predictions: List[float]) -> float:
    # Exclude the first prediction as it's typically biased by model initialization
    filtered = predictions[1:]
    
    # Return mean only if we have valid predictions
    return sum(filtered) / len(filtered) if filtered else 0.0

# ❌ Avoid obvious comments
count = 0  # Set count to 0
```

### Type Hints
```python
# ✅ Always use type hints for clarity
from typing import Optional, List, Dict, Tuple, Union

def process_request(
    user_id: str,
    file_path: str,
    options: Optional[Dict[str, any]] = None,
    retry_count: int = 3
) -> Tuple[bool, Optional[str]]:
    """Process a user request with optional parameters."""
    pass
```

---

## Project Structure

### Backend Directory Organization
```
backend/
├── main.py              # FastAPI application entry point
├── auth.py              # Authentication/authorization logic
├── requirements.txt     # Python dependencies
├── models/              # Data models and schemas
│   ├── __init__.py
│   ├── video.py
│   └── user.py
├── services/            # Business logic layer
│   ├── __init__.py
│   ├── video_service.py
│   └── transcription_service.py
├── routes/              # API endpoint definitions
│   ├── __init__.py
│   ├── videos.py
│   └── transcriptions.py
├── utils/               # Utility functions
│   ├── __init__.py
│   └── validators.py
├── config.py            # Configuration management
└── tests/               # Unit and integration tests
    ├── __init__.py
    ├── test_auth.py
    └── test_services.py
```

### `__init__.py` Pattern
```python
# backend/__init__.py
"""Backend module for video analytics application."""

__version__ = "1.0.0"
__author__ = "Development Team"

# Avoid circular imports; keep minimal exports
```

---

## Error Handling

### Custom Exceptions
```python
# ✅ Create specific, descriptive exceptions
class VideoProcessingError(Exception):
    """Raised when video processing fails."""
    pass

class TranscriptionError(Exception):
    """Raised when transcription service fails."""
    pass

class InvalidVideoFormatError(VideoProcessingError):
    """Raised when video format is not supported."""
    pass

class AuthenticationError(Exception):
    """Raised when user authentication fails."""
    pass
```

### Exception Usage in FastAPI
```python
from fastapi import HTTPException, status

# ✅ Good: Specific HTTP errors with clear messages
def get_video_analysis(video_id: str) -> Dict:
    if not video_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Video ID is required"
        )
    
    try:
        analysis = fetch_analysis(video_id)
    except TranscriptionError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Transcription service error: {str(e)}"
        )
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis not found for video {video_id}"
        )
    
    return analysis
```

### Logging
```python
import logging

logger = logging.getLogger(__name__)

# ✅ Appropriate logging levels
logger.debug("Detailed trace information")
logger.info("User uploaded video: abc123")
logger.warning("Transcription confidence below threshold: 0.75")
logger.error("Failed to process video", exc_info=True)
logger.critical("Database connection lost")
```

---

## Security Best Practices

### Authentication & Authorization
```python
from fastapi import Depends, HTTPException, status
from auth import get_current_user

# ✅ Always validate user permissions
async def delete_video(
    video_id: str,
    current_user: dict = Depends(get_current_user)
) -> Dict:
    video = get_video(video_id)
    
    # Verify ownership
    if video.owner_id != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this video"
        )
    
    # Proceed with deletion
    delete_video_record(video_id)
    return {"message": "Video deleted successfully"}
```

### Sensitive Data
```python
import os
from dotenv import load_dotenv

# ✅ Load from environment variables
load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")
DB_PASSWORD = os.getenv("DATABASE_PASSWORD")

# ❌ Never hardcode secrets
# API_KEY = "sk-abc123xyz"

# ✅ Mask sensitive data in logs
def log_request(request_data: Dict) -> None:
    safe_data = request_data.copy()
    if "password" in safe_data:
        safe_data["password"] = "***"
    logger.info(f"Processing request: {safe_data}")
```

### Input Validation
```python
from pydantic import BaseModel, Field, validator

class VideoAnalysisRequest(BaseModel):
    """Validated request model."""
    
    video_id: str = Field(..., min_length=1, max_length=100)
    analysis_type: str = Field(
        default="transcription",
        regex="^(transcription|sentiment|summary)$"
    )
    language: str = Field(default="en", min_length=2, max_length=5)
    
    @validator("video_id")
    def validate_video_id(cls, value: str) -> str:
        if not value.isalnum():
            raise ValueError("Video ID must be alphanumeric")
        return value.lower()
```

---

## Testing

### Unit Tests
```python
import pytest
from unittest.mock import Mock, patch, MagicMock

class TestVideoProcessor:
    """Test suite for VideoProcessor class."""
    
    @pytest.fixture
    def processor(self):
        """Fixture providing a VideoProcessor instance."""
        return VideoProcessor(max_duration=3600)
    
    def test_initialization(self, processor):
        """Test processor initializes with correct defaults."""
        assert processor.max_duration == 3600
    
    def test_extract_audio_success(self, processor):
        """Test successful audio extraction."""
        mock_file = Mock(spec=['read'])
        mock_file.read.return_value = b'audio_data'
        
        result = processor.extract_audio(mock_file)
        
        assert result == b'audio_data'
        mock_file.read.assert_called_once()
    
    @pytest.mark.parametrize("invalid_format", [".txt", ".docx", ".zip"])
    def test_invalid_formats_rejected(self, processor, invalid_format):
        """Test that invalid formats are rejected."""
        with pytest.raises(ValueError, match="Unsupported format"):
            processor.validate_format(invalid_format)
    
    @patch('services.speech_service.transcribe')
    def test_transcription_with_mock(self, mock_transcribe, processor):
        """Test transcription using mocked service."""
        mock_transcribe.return_value = {
            'transcript': 'Hello world',
            'confidence': 0.95
        }
        
        result = processor.transcribe(b'audio')
        
        assert result['transcript'] == 'Hello world'
        mock_transcribe.assert_called_once()
```

### API Integration Tests
```python
import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)

def test_upload_video_endpoint(client):
    """Test video upload endpoint."""
    files = {"file": ("test.mp4", b"fake_video_content")}
    response = client.post("/api/videos/upload", files=files)
    
    assert response.status_code == 201
    assert "video_id" in response.json()

def test_unauthorized_access(client):
    """Test that unauthorized requests are rejected."""
    response = client.get("/api/videos/abc123")
    assert response.status_code == 401
```

---

## Performance Optimization

### Asynchronous Operations
```python
# ✅ Use async for I/O-bound operations
from fastapi import FastAPI
import aiofiles

app = FastAPI()

@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    """Upload video file asynchronously."""
    async with aiofiles.open(f"videos/{file.filename}", "wb") as f:
        content = await file.read()
        await f.write(content)
    
    return {"filename": file.filename}

# ✅ Use background tasks for non-critical operations
from fastapi import BackgroundTasks

@app.post("/analyze")
async def analyze_video(
    video_id: str,
    background_tasks: BackgroundTasks
):
    """Queue analysis as background task."""
    background_tasks.add_task(process_video_analysis, video_id)
    return {"status": "Processing started"}
```

### Caching
```python
from functools import lru_cache
import redis

# ✅ Local caching for expensive computations
@lru_cache(maxsize=128)
def get_language_model(language_code: str) -> str:
    """Cache language models (max 128)."""
    return load_language_model(language_code)

# ✅ Redis caching for distributed systems
redis_client = redis.Redis(host='localhost', port=6379)

def get_user_settings(user_id: str) -> Dict:
    """Get user settings with Redis cache."""
    cache_key = f"user_settings:{user_id}"
    
    # Check cache first
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Fetch from database
    settings = fetch_user_settings_from_db(user_id)
    
    # Store in cache for 1 hour
    redis_client.setex(cache_key, 3600, json.dumps(settings))
    
    return settings
```

### Batch Operations
```python
# ✅ Batch database operations to reduce I/O
def bulk_update_analysis_status(video_ids: List[str], status: str):
    """Update multiple records in single operation."""
    query = VideoAnalysis.update({"status": status}).where(
        VideoAnalysis.video_id.in_(video_ids)
    )
    query.execute()
```

---

## API & Backend Patterns

### FastAPI Best Practices
```python
from fastapi import FastAPI, APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import List, Optional

app = FastAPI(
    title="Video Analytics API",
    description="API for video analysis and transcription",
    version="1.0.0"
)

# ✅ Use routers for modular endpoints
router = APIRouter(prefix="/api/videos", tags=["videos"])

class VideoResponse(BaseModel):
    """Response model for video data."""
    video_id: str
    filename: str
    status: str
    created_at: str

@router.get("/{video_id}", response_model=VideoResponse)
async def get_video(
    video_id: str,
    current_user: dict = Depends(get_current_user)
) -> VideoResponse:
    """Get video details by ID."""
    video = fetch_video(video_id)
    
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found"
        )
    
    return VideoResponse(**video)

app.include_router(router)
```

### Database Operations
```python
# ✅ Use connection pooling and context managers
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, pool_size=20, max_overflow=0)
SessionLocal = sessionmaker(bind=engine)

def get_db() -> Session:
    """Dependency for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ✅ Use transactions properly
def update_video_metadata(
    video_id: str,
    metadata: Dict,
    db: Session = Depends(get_db)
):
    """Update video with transaction safety."""
    try:
        video = db.query(Video).filter(Video.id == video_id).first()
        if not video:
            raise ValueError("Video not found")
        
        video.metadata = metadata
        db.commit()
        return video
    except Exception as e:
        db.rollback()
        logger.error(f"Database error: {e}")
        raise
```

---

## Dependency Management

### requirements.txt
```
# Format: package==version (pin exact versions in production)
# Group related packages together with comments

# Web Framework
fastapi==0.115.0
uvicorn==0.24.0
pydantic==2.5.0

# Google Cloud Services
google-cloud-speech==2.25.0
google-cloud-storage==2.10.0
google-auth==2.25.0

# Database
sqlalchemy==2.0.23
psycopg2-binary==2.9.9

# Security
python-jose==3.3.0
bcrypt==4.1.0
python-multipart==0.0.6

# Utilities
python-dotenv==1.0.0
requests==2.31.0
aiofiles==23.2.1

# Development & Testing
pytest==7.4.3
pytest-asyncio==0.21.1
black==23.12.0
flake8==6.1.0
```

### Version Management
```bash
# Freeze current environment
pip freeze > requirements.txt

# Install specific versions
pip install -r requirements.txt

# Update packages safely
pip install --upgrade package_name==new_version
```

---

## Git & Version Control

### Commit Messages
```bash
# ✅ Follow conventional commit format
git commit -m "feat: add video transcription API endpoint"
git commit -m "fix: resolve race condition in audio extraction"
git commit -m "docs: update API documentation for v1.1"
git commit -m "test: add unit tests for VideoProcessor class"
git commit -m "refactor: extract database logic into service layer"

# Format: <type>: <subject> [(<scope>)]
# Types: feat, fix, docs, style, refactor, test, chore, perf
```

### .gitignore
```
# Environment
.env
.env.local
.env.*.local
myvenv/
venv/
ENV/

# Python
__pycache__/
*.py[cod]
*.egg-info/
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
.pytest_cache/
htmlcov/
.coverage

# Uploads
uploads/
temp/

# Secrets
secrets.json
credentials.json
```

---

## Summary of Key Principles

1. **Readability**: Code is written for humans first, machines second
2. **Consistency**: Follow agreed standards across the entire project
3. **Documentation**: Document WHY, not WHAT
4. **Testing**: Write tests as you code, aim for >80% coverage
5. **Security**: Never trust user input; always validate and sanitize
6. **Performance**: Optimize for the right bottlenecks; measure first
7. **Maintainability**: Future developers should understand your code
8. **Responsibility**: Take ownership of code quality and security

---

## References

- [PEP 8 - Python Enhancement Proposal](https://pep8.org/)
- [Google Python Style Guide](https://google.github.io/styleguide/pyguide.html)
- [FastAPI Best Practices](https://fastapi.tiangolo.com/best-practices/)
- [OWASP Python Security](https://owasp.org/www-project-python/)

---

**Last Updated**: April 2026  
**Version**: 1.0  
**Status**: Active
