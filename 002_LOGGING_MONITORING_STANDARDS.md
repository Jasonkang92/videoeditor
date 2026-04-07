# Logging & Monitoring Standards

## Table of Contents
1. [Logging Levels](#logging-levels)
2. [Structured Logging](#structured-logging)
3. [Log Format & Structure](#log-format--structure)
4. [Request/Response Logging](#requestresponse-logging)
5. [Database Query Logging](#database-query-logging)
6. [Error Logging](#error-logging)
7. [Performance Monitoring](#performance-monitoring)
8. [Health Checks](#health-checks)
9. [Alerting](#alerting)
10. [Log Retention & Cleanup](#log-retention--cleanup)
11. [Distributed Tracing](#distributed-tracing)
12. [Dashboards & Metrics](#dashboards--metrics)

---

## Logging Levels

### Log Level Definitions

```
DEBUG
- Detailed diagnostic information
- Used only in development
- Variable values, flow control data
- Should NOT be printed in production

INFO
- Confirmatory information
- Successful operations
- Service startup/shutdown
- "User submitted video for transcription"

WARNING
- Something unexpected happened
- Service may degrade
- Retry attempts, deprecated API usage
- "Transcription confidence below threshold: 0.65"

ERROR
- A serious problem occurred
- Service is degraded or failing
- Errors should be tracked and investigated
- "Database connection failed: Connection timeout"

CRITICAL
- The system is in critical condition
- Immediate action required
- Multiple failures cascading
- "Database offline - all services unavailable"
```

### Example Usage (Python)

```python
import logging

logger = logging.getLogger(__name__)

# DEBUG - Development only
logger.debug("Processing video", extra={"video_id": "abc123", "chunk_size": 512})

# INFO - Important events
logger.info("Video upload completed", extra={"video_id": "abc123", "size_mb": 256})

# WARNING - Potential issues
logger.warning("API response slow", extra={"service": "speech-to-text", "latency_ms": 5000})

# ERROR - Something failed
logger.error("Transcription failed", exc_info=True, extra={"video_id": "abc123"})

# CRITICAL - System is down
logger.critical("Database unreachable - blocking all requests")
```

---

## Structured Logging

### JSON-Structured Logging

```python
import json
import logging
from datetime import datetime

class JSONFormatter(logging.Formatter):
    """Format logs as JSON for easy parsing."""
    
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add extra fields
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add custom fields from extra dict
        if hasattr(record, "__dict__"):
            for key, value in record.__dict__.items():
                if key not in ["name", "msg", "args", "created", "filename", 
                               "funcName", "levelname", "levelno", "lineno", 
                               "module", "pathname", "process", "processName", 
                               "thread", "threadName"]:
                    log_data[key] = value
        
        return json.dumps(log_data)

# Configure
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
```

### Example JSON Output

```json
{
  "timestamp": "2026-04-06T10:30:15.123Z",
  "level": "INFO",
  "logger": "video_service",
  "message": "Video transcription started",
  "module": "transcriber",
  "function": "TranscriptionService.start",
  "line": 87,
  "video_id": "vid_abc123",
  "user_id": "user_xyz789",
  "language": "en",
  "duration_seconds": 3600,
  "confidence_threshold": 0.8,
  "request_id": "req_12345"
}
```

---

## Log Format & Structure

### Standard Log Context

Every log entry should include:

```python
def log_with_context(level, message, **context):
    """Log with standardized context."""
    logger.log(level, message, extra={
        "request_id": context.get("request_id"),           # Unique request identifier
        "user_id": context.get("user_id"),                 # User performing action
        "session_id": context.get("session_id"),           # Session identifier
        "trace_id": context.get("trace_id"),               # Distributed trace ID
        "module": context.get("module"),                   # Code module/service
        "action": context.get("action"),                   # Action being performed
        "status": context.get("status"),                   # Success/failure status
        "duration_ms": context.get("duration_ms"),         # Operation duration
        "ip_address": context.get("ip_address"),           # Client IP
        "user_agent": context.get("user_agent"),           # Browser/client info
    })
```

### Context Manager for Logging

```python
from contextlib import contextmanager
import time

@contextmanager
def log_operation(operation_name, user_id, **context):
    """Context manager for logging operations."""
    request_id = context.get("request_id")
    start_time = time.time()
    
    logger.info(f"{operation_name} started", extra={
        "request_id": request_id,
        "user_id": user_id,
        "operation": operation_name,
        **context
    })
    
    try:
        yield
        duration_ms = (time.time() - start_time) * 1000
        logger.info(f"{operation_name} completed", extra={
            "request_id": request_id,
            "user_id": user_id,
            "operation": operation_name,
            "status": "success",
            "duration_ms": int(duration_ms),
            **context
        })
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        logger.error(f"{operation_name} failed", exc_info=True, extra={
            "request_id": request_id,
            "user_id": user_id,
            "operation": operation_name,
            "status": "failure",
            "duration_ms": int(duration_ms),
            "error": str(e),
            **context
        })
        raise

# Usage
with log_operation("video_transcription", user_id="user_123", 
                   video_id="vid_abc", request_id="req_12345"):
    transcribe_video(video_id)
```

---

## Request/Response Logging

### Request Logging Middleware

```python
from fastapi import Request
from time import time
import uuid

@app.middleware("http")
async def log_request_response(request: Request, call_next):
    """Log all HTTP requests and responses."""
    request_id = str(uuid.uuid4())
    start_time = time()
    
    # Log request
    logger.info("Request received", extra={
        "request_id": request_id,
        "method": request.method,
        "path": request.url.path,
        "query_params": dict(request.query_params),
        "client_ip": request.client.host if request.client else "unknown",
        "user_agent": request.headers.get("user-agent", "unknown"),
    })
    
    try:
        response = await call_next(request)
        duration_ms = (time() - start_time) * 1000
        
        # Log response
        logger.info("Request completed", extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": int(duration_ms),
        })
        
        # Add request ID to response
        response.headers["X-Request-ID"] = request_id
        return response
        
    except Exception as e:
        duration_ms = (time() - start_time) * 1000
        logger.error("Request failed", exc_info=True, extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "duration_ms": int(duration_ms),
            "error": str(e),
        })
        raise
```

### Sensitive Data Sanitization

```python
def sanitize_log_data(data: dict) -> dict:
    """Remove sensitive information from logs."""
    sensitive_keys = {"password", "token", "api_key", "secret", "credential"}
    sanitized = data.copy()
    
    for key in sensitive_keys:
        if key in sanitized:
            sanitized[key] = "***REDACTED***"
    
    return sanitized

# Usage
logger.info("User login", extra=sanitize_log_data({
    "username": "john@example.com",
    "password": "secret123",  # Will be redacted
    "api_key": "sk_live_abc123"  # Will be redacted
}))
```

---

## Database Query Logging

### Query Performance Logging

```python
import time
from sqlalchemy.event import listen
from sqlalchemy.engine import Engine

@listen(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """Log database queries."""
    conn.info.setdefault('query_start_time', []).append(time.time())

@listen(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """Log query duration."""
    total = time.time() - conn.info['query_start_time'].pop()
    
    logger.debug("Database query executed", extra={
        "query": statement[:200],  # First 200 chars
        "duration_ms": int(total * 1000),
        "rows_returned": cursor.rowcount if hasattr(cursor, 'rowcount') else None,
    })
    
    # Warn if query is slow
    if total > 1.0:  # More than 1 second
        logger.warning("Slow database query", extra={
            "query": statement[:200],
            "duration_ms": int(total * 1000),
        })
```

---

## Error Logging

### Detailed Error Logging

```python
def log_error_with_context(error: Exception, context: dict):
    """Log error with full context."""
    logger.error(
        f"Error: {error.__class__.__name__}",
        exc_info=True,
        extra={
            "request_id": context.get("request_id"),
            "user_id": context.get("user_id"),
            "error_type": error.__class__.__name__,
            "error_message": str(error),
            "error_args": error.args,
            "context": context,
        }
    )

# Usage
try:
    transcribe_video(video_id)
except TranscriptionError as e:
    log_error_with_context(e, {
        "request_id": request_id,
        "user_id": user_id,
        "video_id": video_id,
        "action": "transcription",
    })
```

---

## Performance Monitoring

### Metrics to Track

```
Request Metrics:
- Request count by endpoint
- Response time (p50, p95, p99)
- Error rate by endpoint
- Status code distribution

System Metrics:
- CPU usage
- Memory usage
- Disk I/O
- Network I/O

Application Metrics:
- Video upload count
- Transcription completion rate
- Average transcription latency
- Analysis success rate
- Database connection pool usage

Business Metrics:
- Active users
- Videos processed per hour
- Analysis completion rate
- User satisfaction (error rates)
```

### Performance Logging Example

```python
import time
from functools import wraps

def track_performance(func):
    """Decorator to track function performance."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            duration_ms = (time.time() - start_time) * 1000
            logger.info(f"{func.__name__} completed", extra={
                "function": func.__name__,
                "duration_ms": int(duration_ms),
                "status": "success",
            })
            return result
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000
            logger.error(f"{func.__name__} failed", exc_info=True, extra={
                "function": func.__name__,
                "duration_ms": int(duration_ms),
                "status": "failure",
                "error": str(e),
            })
            raise
    return wrapper

@track_performance
async def transcribe_video(video_id):
    """Transcribe video - performance will be tracked."""
    pass
```

---

## Health Checks

### Health Check Endpoint

```python
@app.get("/health")
async def health_check() -> dict:
    """Check health of all services."""
    health_status = {
        "status": "healthy",
        "services": {
            "database": await check_database(),
            "google_cloud": await check_google_cloud(),
            "redis": await check_redis(),
        },
        "timestamp": datetime.utcnow().isoformat(),
    }
    
    # Overall status
    all_healthy = all(s.get("status") == "healthy" 
                      for s in health_status["services"].values())
    health_status["status"] = "healthy" if all_healthy else "degraded"
    
    status_code = 200 if all_healthy else 503
    return health_status, status_code

async def check_database() -> dict:
    """Check database connectivity."""
    try:
        await db.execute("SELECT 1")
        return {"status": "healthy", "latency_ms": 15}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

---

## Alerting

### Alert Thresholds

```
Critical Alerts (immediate response):
- Error rate > 1% for 1 minute
- Database connection failed
- Service response timeout > 30 seconds
- Disk space < 10%
- Memory usage > 90%

High Priority Alerts (within 5 minutes):
- Response time p95 > 2 seconds
- Deployment failure
- SSL certificate expiring < 7 days
- Transcription failure rate > 5%

Medium Priority Alerts (within 1 hour):
- Slow query (> 2 seconds)
- Cache hit rate < 80%
- API rate limit triggered
- Deprecated API endpoint used

Low Priority Alerts (daily review):
- New warnings in logs
- Outdated dependencies available
- Test coverage decreased
```

### Alert Implementation Example

```python
import requests

def send_alert(level: str, title: str, message: str):
    """Send alert to monitoring service."""
    alert_data = {
        "level": level,  # critical, high, medium, low
        "title": title,
        "message": message,
        "timestamp": datetime.utcnow().isoformat(),
        "service": "video-analytics-api",
    }
    
    # Send to monitoring service (e.g., PagerDuty, OpsGenie)
    requests.post(
        "https://monitoring.example.com/alerts",
        json=alert_data,
        headers={"Authorization": f"Bearer {MONITORING_API_KEY}"}
    )

# Usage
if error_rate > 0.01:
    send_alert(
        level="critical",
        title="High error rate detected",
        message=f"Error rate is {error_rate*100:.2f}%"
    )
```

---

## Log Retention & Cleanup

### Log Retention Policy

```
Development:
- 7 days retention
- Delete after 7 days

Staging:
- 30 days retention
- Delete after 30 days

Production:
- 90 days hot storage (searchable)
- 1 year cold storage (archive)
- Delete after 1 year (unless compliance requires longer)

Compliance/Audit Logs:
- 3 years minimum
- Immutable storage
- Encrypted
```

### Cleanup Configuration

```python
# Example using Python scheduled task
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta

scheduler = BackgroundScheduler()

@scheduler.scheduled_job('cron', hour=2)  # Run at 2 AM daily
def cleanup_old_logs():
    """Delete logs older than retention period."""
    retention_days = 90
    cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
    
    # Delete from log service
    delete_logs_before(cutoff_date)
    logger.info("Log cleanup completed", extra={
        "cutoff_date": cutoff_date.isoformat(),
        "retention_days": retention_days,
    })

scheduler.start()
```

---

## Distributed Tracing

### Trace ID Propagation

```python
import uuid
from fastapi import Request, Header
from typing import Optional

async def get_trace_id(
    request: Request,
    x_trace_id: Optional[str] = Header(None)
) -> str:
    """Get or create trace ID for distributed tracing."""
    if x_trace_id:
        return x_trace_id
    return str(uuid.uuid4())

@app.middleware("http")
async def add_trace_id(request: Request, call_next):
    """Propagate trace ID through request."""
    trace_id = await get_trace_id(request, request.headers.get("X-Trace-ID"))
    request.state.trace_id = trace_id
    response = await call_next(request)
    response.headers["X-Trace-ID"] = trace_id
    return response
```

---

## Dashboards & Metrics

### Key Metrics Dashboard

```
Real-time Metrics:
- Requests per second
- Error rate (%)
- Response time (p50, p95, p99)
- Active users
- Database connections

Service Metrics:
- Transcription success rate
- Analysis completion rate
- Average processing time
- Queue depth (pending jobs)
- Cache hit rate

Infrastructure:
- CPU usage (%)
- Memory usage (%)
- Disk usage (%)
- Network throughput (Mbps)
- Database query latency
```

---

**Last Updated**: April 2026  
**Version**: 1.0  
**Status**: Active
