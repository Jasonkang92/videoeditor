# Error Handling & Monitoring Standards

## Table of Contents
1. [Error Code Standards](#error-code-standards)
2. [Error Message Guidelines](#error-message-guidelines)
3. [Exception Hierarchy](#exception-hierarchy)
4. [Retry Logic](#retry-logic)
5. [Circuit Breakers](#circuit-breakers)
6. [Error Tracking](#error-tracking)
7. [User-Facing vs Internal Errors](#user-facing-vs-internal-errors)
8. [Graceful Degradation](#graceful-degradation)
9. [Alert Management](#alert-management)
10. [Error Recovery Strategies](#error-recovery-strategies)

---

## Error Code Standards

### Application Error Codes

```
Standard Error Code Format: [SERVICE]_[ERROR_TYPE]_[DETAIL]

100-199: Authentication & Authorization
  101: INVALID_CREDENTIALS
  102: TOKEN_EXPIRED
  103: INSUFFICIENT_PERMISSIONS
  104: INVALID_TOKEN
  105: SESSION_NOT_FOUND

200-299: Validation Errors
  201: INVALID_INPUT
  202: MISSING_FIELD
  203: INVALID_FORMAT
  204: VALUE_OUT_OF_RANGE
  205: DUPLICATE_RESOURCE

300-399: Resource Errors
  301: NOT_FOUND
  302: ALREADY_EXISTS
  303: RESOURCE_LOCKED
  304: RESOURCE_CONFLICT

400-499: Service Errors
  401: SERVICE_UNAVAILABLE
  402: DATABASE_ERROR
  403: EXTERNAL_API_ERROR
  404: TIMEOUT
  405: RATE_LIMIT_EXCEEDED

500-599: System Errors
  501: INTERNAL_ERROR
  502: OUT_OF_MEMORY
  503: DISK_FULL
  504: UNKNOWN_ERROR
```

### Error Code Usage (Python)

```python
from enum import Enum

class ErrorCode(Enum):
    INVALID_CREDENTIALS = (101, "Invalid username or password")
    TOKEN_EXPIRED = (102, "Authentication token has expired")
    INSUFFICIENT_PERMISSIONS = (103, "User lacks required permissions")
    INVALID_INPUT = (201, "Input validation failed")
    NOT_FOUND = (301, "Requested resource not found")
    SERVICE_UNAVAILABLE = (401, "Service temporarily unavailable")
    INTERNAL_ERROR = (501, "Internal server error")

class AppError(Exception):
    """Application error with code and message."""
    
    def __init__(self, error_code: ErrorCode, detail: str = None):
        self.code = error_code.value[0]
        self.message = error_code.value[1]
        self.detail = detail or ""
        super().__init__(self.message)

@app.exception_handler(AppError)
async def handle_app_error(request: Request, exc: AppError):
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "detail": exc.detail
            }
        }
    )
```

---

## Error Message Guidelines

### Clear Error Messages

```python
# ❌ BAD: Unclear
raise ValueError("Invalid")

# ❌ BAD: Too vague
raise Exception("Error occurred")

# ✅ GOOD: Specific and actionable
raise ValueError("Email must be a valid email address (e.g., user@example.com)")

# ✅ GOOD: Suggests solution
raise ValueError("File size exceeds 500MB limit. Please compress the video and try again.")

# Error Message Template
"{Action} failed: {Reason}. {Suggestion}"

Examples:
"Video upload failed: File size exceeds maximum (500MB). Compress video and retry."
"Transcription failed: Language code 'xyz' not supported. Use 'en', 'es', or 'fr'."
"Database connection failed: Connection timeout. Check database is running and accessible."
```

### Don't Expose Internals

```python
# ❌ BAD: Leaks database details
"Database error: Duplicate key value violates unique constraint 'users_email_key'"

# ✅ GOOD: Generic for users, specific in logs
"An error occurred processing your request. Reference: #12345"

# In logs, log full details
logger.error("Database error", exc_info=True, extra={
    "request_id": "req_12345",
    "full_error": str(e)
})
```

---

## Exception Hierarchy

### Custom Exceptions (Python)

```python
# Base exception
class VideoAnalyticsError(Exception):
    """Base exception for all application errors."""
    def __init__(self, message, code=None, details=None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(message)

# Authentication errors
class AuthenticationError(VideoAnalyticsError):
    """User authentication failed."""
    pass

class TokenExpiredError(AuthenticationError):
    """JWT token has expired."""
    pass

# Validation errors
class ValidationError(VideoAnalyticsError):
    """Input validation failed."""
    pass

# Business logic errors
class VideoProcessingError(VideoAnalyticsError):
    """Video processing failed."""
    pass

class TranscriptionError(VideoProcessingError):
    """Transcription service error."""
    def __init__(self, message, retryable=False):
        super().__init__(message)
        self.retryable = retryable

# External service errors
class ExternalServiceError(VideoAnalyticsError):
    """External API/service error."""
    pass

# Usage
raise ValidationError(
    "Invalid video format",
    code=203,
    details={"field": "format", "supported": ["mp4", "webm"]}
)
```

---

## Retry Logic

### Exponential Backoff Retry

```python
import asyncio
from typing import Callable, TypeVar, Any

T = TypeVar('T')

async def retry_with_backoff(
    func: Callable[..., Any],
    max_retries: int = 3,
    initial_delay: float = 1,
    max_delay: float = 60
) -> T:
    """
    Retry function with exponential backoff.
    
    Delays: 1s, 2s, 4s, 8s, ...
    Max delay: 60s
    """
    last_exception = None
    
    for attempt in range(max_retries):
        try:
            return await func()
        except (ConnectionError, TimeoutError) as e:
            last_exception = e
            
            if attempt == max_retries - 1:
                raise
            
            # Exponential backoff: 2^attempt
            delay = min(initial_delay * (2 ** attempt), max_delay)
            
            logger.warning(
                f"Attempt {attempt + 1} failed, retrying in {delay}s",
                extra={"error": str(e), "delay_seconds": delay}
            )
            
            await asyncio.sleep(delay)
    
    raise last_exception

# Usage
async def transcribe_with_retry(video_id):
    async def _transcribe():
        return await speech_service.transcribe(video_id)
    
    return await retry_with_backoff(_transcribe, max_retries=3)
```

### Retry Decorator

```python
def retry(
    max_attempts: int = 3,
    delay: float = 1,
    backoff: float = 2,
    exceptions: tuple = (Exception,)
):
    """Decorator to retry function with backoff."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    if attempt == max_attempts - 1:
                        raise
                    
                    wait_time = delay * (backoff ** attempt)
                    await asyncio.sleep(wait_time)
        
        return wrapper
    return decorator

@retry(max_attempts=3, delay=1, exceptions=(TimeoutError,))
async def call_external_api():
    return await fetch_data()
```

---

## Circuit Breakers

### Circuit Breaker Implementation

```python
import time
from enum import Enum

class CircuitState(Enum):
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failing, reject requests
    HALF_OPEN = "half_open" # Testing if recovered

class CircuitBreaker:
    """Prevent cascading failures."""
    
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
    
    async def call(self, func, *args, **kwargs):
        """Call function through circuit breaker."""
        
        if self.state == CircuitState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitState.HALF_OPEN
            else:
                raise Exception("Circuit breaker is OPEN")
        
        try:
            result = await func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise
    
    def _on_success(self):
        """Reset on success."""
        self.failure_count = 0
        self.state = CircuitState.CLOSED
    
    def _on_failure(self):
        """Record failure."""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
            logger.warning(f"Circuit breaker opened after {self.failure_count} failures")
    
    def _should_attempt_reset(self) -> bool:
        """Check if recovery timeout has passed."""
        return (
            time.time() - self.last_failure_time >= self.recovery_timeout
        )

# Usage
speech_breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=60)

async def safe_transcribe(video_id):
    try:
        return await speech_breaker.call(speech_service.transcribe, video_id)
    except Exception:
        # Fallback behavior
        return {"status": "temporarily_unavailable"}
```

---

## Error Tracking

### Sentry Integration (Python)

```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,  # 10% sampling
    environment=os.getenv("ENVIRONMENT", "development"),
    release="1.0.0"
)

# Automatic error tracking
@app.get("/api/v1/videos/{video_id}")
async def get_video(video_id: str):
    """Errors are automatically sent to Sentry."""
    video = fetch_video(video_id)
    return video

# Manual error tracking
try:
    process_video(video_id)
except Exception as e:
    sentry_sdk.capture_exception(e)
    raise

# Set user context
sentry_sdk.set_user({
    "id": user_id,
    "email": user_email
})
```

---

## User-Facing vs Internal Errors

### Error Response Distinction

```python
# ✅ User-facing error (safe to display)
{
  "success": false,
  "error": {
    "code": "INVALID_VIDEO_FORMAT",
    "message": "Video format not supported. Upload MP4, WebM, or AVI files.",
    "details": {
      "supported_formats": ["mp4", "webm", "avi"],
      "uploaded_format": "mov"
    }
  }
}

# ❌ Internal error (generic for user)
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "An unexpected error occurred. Reference: req_abc123"
  }
}

# Full error logged internally
{
  "request_id": "req_abc123",
  "error": "psycopg2.IntegrityError: duplicate key value violates unique constraint",
  "full_traceback": "..."
}
```

---

## Graceful Degradation

### Services Fallback

```python
class VideoService:
    """Video service with graceful degradation."""
    
    def __init__(self, transcription_service, analysis_service):
        self.transcription = transcription_service
        self.analysis = analysis_service
    
    async def get_video_with_full_data(self, video_id):
        """Get video with optional transcription and analysis."""
        try:
            video = await fetch_video(video_id)
        except Exception as e:
            logger.error(f"Failed to fetch video: {e}")
            return None
        
        # Graceful degradation: transcription optional
        try:
            transcription = await self.transcription.get(video_id)
        except Exception as e:
            logger.warning(f"Transcription unavailable: {e}")
            transcription = None
        
        # Graceful degradation: analysis optional
        try:
            analysis = await self.analysis.get(video_id)
        except Exception as e:
            logger.warning(f"Analysis unavailable: {e}")
            analysis = None
        
        return {
            "video": video,
            "transcription": transcription,  # May be None
            "analysis": analysis,  # May be None
        }
```

---

## Alert Management

### Alert Thresholds

```
Critical (immediate):
- Error rate > 5% for 1 min
- Response time p99 > 10s
- Database down
- Out of memory

High (within 5 min):
- Error rate > 2% for 2 min
- Response time p95 > 3s
- Slow query detected

Medium (within 1 hour):
- Error rate > 1% for 5 min
- Response time p95 > 1s
- Disk usage > 80%

Low (daily review):
- Deprecation warnings
- Outdated dependencies
```

---

## Error Recovery Strategies

### Common Recovery Patterns

```python
# Pattern 1: Retry
async def call_with_retry():
    return await retry_with_backoff(external_api_call)

# Pattern 2: Fallback
try:
    result = await primary_service()
except Exception:
    result = await fallback_service()

# Pattern 3: Cache
cached_result = await cache.get(key)
if not cached_result:
    cached_result = await fetch_from_service()
    await cache.set(key, cached_result, ttl=3600)

# Pattern 4: Circuit Breaker
return await circuit_breaker.call(protected_service)

# Pattern 5: Timeout
try:
    result = await asyncio.wait_for(
        long_operation(),
        timeout=30
    )
except asyncio.TimeoutError:
    return default_value
```

---

**Last Updated**: April 2026  
**Version**: 1.0  
**Status**: Active
