# API Design & RESTful Standards

## Table of Contents
1. [RESTful Conventions](#restful-conventions)
2. [Endpoint Naming](#endpoint-naming)
3. [HTTP Methods](#http-methods)
4. [Status Codes](#status-codes)
5. [Request/Response Format](#requestresponse-format)
6. [Pagination & Filtering](#pagination--filtering)
7. [Versioning](#versioning)
8. [Error Responses](#error-responses)
9. [API Documentation](#api-documentation)
10. [Rate Limiting](#rate-limiting)
11. [Authentication Headers](#authentication-headers)
12. [Deprecation Policy](#deprecation-policy)

---

## RESTful Conventions

### Resource-Oriented Design

```
✅ Resources (nouns):
GET    /api/v1/videos              # List videos
GET    /api/v1/videos/{id}         # Get single video
POST   /api/v1/videos              # Create video
PUT    /api/v1/videos/{id}         # Update video
DELETE /api/v1/videos/{id}         # Delete video

✅ Nested Resources:
GET    /api/v1/videos/{id}/transcriptions
GET    /api/v1/videos/{id}/transcriptions/{trans_id}
POST   /api/v1/videos/{id}/transcriptions

❌ Action-Oriented (Anti-pattern):
GET    /api/v1/getVideo
POST   /api/v1/createVideo
GET    /api/v1/deleteVideo
```

### Collection vs. Single Resource

```
Collection (plural, lowercase):
GET    /api/v1/videos
POST   /api/v1/videos

Single Resource (with ID):
GET    /api/v1/videos/{video_id}
PUT    /api/v1/videos/{video_id}
DELETE /api/v1/videos/{video_id}
```

---

## Endpoint Naming

### Naming Conventions

```
✅ Use lowercase with hyphens
/api/v1/user-videos
/api/v1/video-analysis
/api/v1/transcription-settings

✅ Use meaningful, descriptive names
/api/v1/videos/search
/api/v1/users/{id}/preferences
/api/v1/analysis/{id}/results

❌ Avoid abbreviations
/api/v1/vid            # ❌ Too vague
/api/v1/usr/prefs      # ❌ Unclear

❌ Avoid verbs (except for operations)
/api/v1/getVideos      # ❌ Use GET method instead
/api/v1/createUser     # ❌ Use POST method instead
```

### Query Parameters for Operations

```
✅ For filtering and operations:
GET /api/v1/videos?status=processing
GET /api/v1/videos?language=en&sort=created_at
GET /api/v1/videos/search?q=machine+learning
POST /api/v1/videos/{id}/actions/transcribe
POST /api/v1/videos/{id}/actions/analyze

```

---

## HTTP Methods

### Method Usage Guidelines

```
GET     - Retrieve resource(s)
         - Safe: Does not modify data
         - Idempotent: Multiple calls = single call
         - Cacheable: Can be cached

POST    - Create new resource
         - Not idempotent: Multiple calls create multiple resources
         - Request body required
         - Returns 201 Created with Location header

PUT     - Replace entire resource
         - Idempotent: Multiple calls = single call
         - Requires complete resource representation
         - Returns 200 OK or 204 No Content

PATCH   - Partial update to resource
         - Idempotent (usually)
         - Request body contains only changed fields
         - Returns 200 OK or 204 No Content

DELETE  - Remove resource
         - Idempotent: Multiple calls safe
         - Returns 204 No Content

HEAD    - Like GET but no response body
         - Useful for checking if resource exists
         - Same status code as GET

OPTIONS - Describe communication options
         - CORS preflight requests
         - Returns allowed methods in Allow header
```

### Examples

```python
# Python FastAPI examples

# ✅ GET - Retrieve resource
@app.get("/api/v1/videos/{video_id}")
async def get_video(video_id: str):
    """Retrieve video by ID."""
    video = fetch_video(video_id)
    return video

# ✅ POST - Create resource
@app.post("/api/v1/videos", status_code=201)
async def create_video(request: VideoCreateRequest):
    """Create new video."""
    video = create_video_record(request)
    return {"id": video.id, "status": "created"}

# ✅ PUT - Replace entire resource
@app.put("/api/v1/videos/{video_id}")
async def update_video(video_id: str, request: VideoUpdateRequest):
    """Replace entire video."""
    video = update_video_record(video_id, request)
    return video

# ✅ PATCH - Partial update
@app.patch("/api/v1/videos/{video_id}")
async def patch_video(video_id: str, request: VideoPatchRequest):
    """Partially update video."""
    video = patch_video_record(video_id, request)
    return video

# ✅ DELETE - Remove resource
@app.delete("/api/v1/videos/{video_id}", status_code=204)
async def delete_video(video_id: str):
    """Delete video."""
    delete_video_record(video_id)
    return None
```

---

## Status Codes

### 2xx Success Codes

```
200 - OK
      ✅ Successful GET
      ✅ Successful PUT/PATCH
      ✅ Successful POST (when returning updated resource)

201 - Created
      ✅ POST: Resource created successfully
      ✅ Include Location header with new resource URL

202 - Accepted
      ✅ Request accepted but not yet processed
      ✅ Async operations (transcription, analysis)
      ✅ Return status/tracking URL

204 - No Content
      ✅ DELETE: Successfully deleted
      ✅ PUT/PATCH: Successfully updated (no response body)

206 - Partial Content
      ✅ Range requests (file downloads)
      ✅ Include Content-Range header
```

### 3xx Redirection Codes

```
301 - Moved Permanently
      ✅ Endpoint moved to new URL permanently
      ✅ Include Location header

304 - Not Modified
      ✅ Resource unchanged (caching)
      ✅ Send if client provides ETag/Last-Modified

307 - Temporary Redirect
      ✅ Temporary endpoint move
      ✅ Client should retry at new location
```

### 4xx Client Error Codes

```
400 - Bad Request
      ❌ Invalid request format
      ❌ Missing required fields
      ❌ Invalid query parameters
      
      Example: Missing content-type header, malformed JSON

401 - Unauthorized
      ❌ Missing authentication
      ❌ Invalid/expired token
      
      Example: No Authorization header, expired JWT

403 - Forbidden
      ❌ Authenticated but not authorized
      ❌ User lacks permissions
      
      Example: User tries to delete another user's video

404 - Not Found
      ❌ Resource does not exist
      ❌ Invalid resource ID
      
      Example: Video ID doesn't exist in database

409 - Conflict
      ❌ Request conflicts with current state
      ❌ Duplicate resource
      
      Example: Creating video with duplicate ID

410 - Gone
      ❌ Resource deleted permanently
      ❌ Different from 404 (intentionally removed)
      
      Example: Archived video no longer available

422 - Unprocessable Entity
      ❌ Syntax correct but semantically invalid
      ❌ Validation errors
      
      Example: Invalid video format, invalid language code

429 - Too Many Requests
      ❌ Rate limit exceeded
      ❌ Client should retry after delay
      
      Example: Exceeded 10 requests per minute limit
```

### 5xx Server Error Codes

```
500 - Internal Server Error
      ❌ Unexpected server error
      ❌ Generic error when nothing else applies
      
      Example: Database connection failed, unhandled exception

502 - Bad Gateway
      ❌ Invalid response from upstream service
      ❌ External API failed
      
      Example: Google Cloud Speech service unavailable

503 - Service Unavailable
      ❌ Server temporarily unavailable
      ❌ Maintenance or overloaded
      
      Example: Server restarting, database maintenance

504 - Gateway Timeout
      ❌ Upstream service timed out
      ❌ Request took too long
      
      Example: Transcription service timeout
```

---

## Request/Response Format

### Content Negotiation

```python
# ✅ Always use JSON
# application/json (default and recommended)

# Request
POST /api/v1/videos
Content-Type: application/json

{
  "filename": "video.mp4",
  "title": "My Video",
  "language": "en"
}

# Response
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v1/videos/abc123

{
  "id": "abc123",
  "filename": "video.mp4",
  "title": "My Video",
  "status": "created",
  "created_at": "2026-04-06T10:30:00Z"
}
```

### Standard Response Format

```json
{
  "success": true,
  "data": {
    "id": "video_123",
    "title": "Sample Video",
    "duration": 3600,
    "created_at": "2026-04-06T10:30:00Z"
  },
  "metadata": {
    "request_id": "req_abc123",
    "timestamp": "2026-04-06T10:30:05Z"
  }
}
```

### List Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": "video_1",
      "title": "Video 1"
    },
    {
      "id": "video_2",
      "title": "Video 2"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "has_next": true,
    "has_prev": false
  },
  "metadata": {
    "request_id": "req_abc123",
    "timestamp": "2026-04-06T10:30:05Z"
  }
}
```

---

## Pagination & Filtering

### Pagination Standards

```
GET /api/v1/videos?limit=10&offset=0

✅ Parameters:
- limit: Number of items (default: 10, max: 100)
- offset: Number of items to skip (default: 0)
OR
- page: Page number (default: 1)
- per_page: Items per page (default: 10, max: 100)

✅ Response includes:
{
  "pagination": {
    "total": 1000,
    "limit": 10,
    "offset": 0,
    "page": 1,
    "pages": 100,
    "has_next": true,
    "has_prev": false
  }
}
```

### Filtering Standards

```
GET /api/v1/videos?status=processing&language=en

✅ Filter formats:
status=processing          # Exact match
created_at>=2026-01-01    # Range (date)
duration>300              # Greater than
duration<600              # Less than
duration[]=300&duration[]=600  # Multiple values
search=keyword            # Full-text search
```

### Sorting Standards

```
GET /api/v1/videos?sort=-created_at,title

✅ Sorting:
sort=created_at           # Ascending
sort=-created_at          # Descending (prefix with -)
sort=title,created_at     # Multiple fields
sort=-created_at,title    # Mix asc/desc
```

---

## Versioning

### URL-Based Versioning (Recommended)

```
✅ Version in URL path:
/api/v1/videos
/api/v2/videos

✅ Benefits:
- Clear in URL
- Easy to route
- Cache-friendly
- Multiple versions coexist

✅ Implementation:
@app.get("/api/v1/videos")
async def list_videos_v1():
    pass

@app.get("/api/v2/videos")
async def list_videos_v2():
    # Different implementation
    pass
```

### Versioning Strategy

```
Semantic Versioning:
v1, v2, v3, ... (major versions only in URL)

✅ Use major versions in URL
/api/v1/
/api/v2/

❌ Don't encode minor versions
/api/v1.1/  # Too granular

Deprecation Timeline:
- Announce: 6 months before sunset
- Support: Old and new versions in parallel
- Sunset: Remove after deprecation period
```

---

## Error Responses

### Standardized Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "filename",
        "message": "Must not be empty"
      },
      {
        "field": "file_size",
        "message": "Must be less than 500 MB"
      }
    ]
  },
  "metadata": {
    "request_id": "req_abc123",
    "timestamp": "2026-04-06T10:30:05Z"
  }
}
```

### Error Code Standards

```
VALIDATION_ERROR       - Input validation failed
UNAUTHORIZED          - Missing/invalid authentication
FORBIDDEN             - Insufficient permissions
NOT_FOUND             - Resource not found
CONFLICT              - Resource conflict/duplicate
RATE_LIMIT_EXCEEDED   - Too many requests
INTERNAL_ERROR        - Server error
SERVICE_UNAVAILABLE   - Dependency unavailable
```

### Error Handling (Python)

```python
from fastapi import HTTPException, status

@app.post("/api/v1/videos")
async def create_video(request: VideoCreateRequest):
    # Validation error
    if not request.filename:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={
                "code": "VALIDATION_ERROR",
                "message": "Filename is required",
                "details": [{"field": "filename", "message": "Must not be empty"}]
            }
        )
    
    # Authorization error
    if not user_has_permission(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "FORBIDDEN",
                "message": "You don't have permission to upload videos"
            }
        )
    
    # Resource not found
    if not video_exists(video_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "NOT_FOUND",
                "message": f"Video {video_id} not found"
            }
        )
```

---

## API Documentation

### OpenAPI/Swagger Standards

```python
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

app = FastAPI(
    title="Video Analytics API",
    description="API for video analysis and transcription",
    version="1.0.0",
    contact={
        "name": "API Support",
        "url": "https://example.com/support",
        "email": "api-support@example.com"
    },
    license_info={
        "name": "Apache 2.0",
        "url": "https://www.apache.org/licenses/LICENSE-2.0.html"
    }
)

@app.get("/api/v1/videos/{video_id}", tags=["Videos"])
async def get_video(
    video_id: str,
    include_metadata: bool = False
) -> VideoResponse:
    """
    Get video details by ID.
    
    Retrieves complete information about a specific video including
    metadata, transcription status, and analysis results.
    
    Args:
        video_id: Unique video identifier
        include_metadata: Whether to include detailed metadata
    
    Returns:
        VideoResponse: Video object with all details
    
    Raises:
        404: Video not found
        401: Unauthorized access
    """
    pass
```

### Documentation Best Practices

```
✅ Every endpoint should include:
- Description of what it does
- Parameter explanations
- Return type and structure
- Possible error codes
- Example requests/responses

✅ Tag endpoints by resource:
@app.get(.., tags=["Videos"])
@app.post(.., tags=["Videos"])
@app.get(.., tags=["Transcriptions"])

✅ Use examples in documentation:
{
  "example": {
    "id": "video_123",
    "title": "Sample Video",
    "status": "processed"
  }
}
```

---

## Rate Limiting

### Rate Limiting Standards

```
✅ Implement per-user rate limits:
- 100 requests per minute per API key
- 1,000 requests per hour per user
- 10 MB/minute upload bandwidth

✅ Return rate limit headers:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 75
X-RateLimit-Reset: 1680768605

✅ Return 429 when exceeded:
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Retry after 60 seconds"
  }
}
```

---

## Authentication Headers

### Bearer Token Format

```
✅ Standard Bearer Token:
Authorization: Bearer <token>

✅ Example:
GET /api/v1/videos
Authorization: Bearer eyJhbGc...

✅ Response for missing token:
HTTP/1.1 401 Unauthorized
{
  "code": "UNAUTHORIZED",
  "message": "Missing or invalid Authorization header"
}
```

---

## Deprecation Policy

### Deprecation Timeline

```
Phase 1: Announcement (T+0 days)
- Announce deprecation in status page
- Email to API users
- Add deprecation warning to docs
- Mark in Swagger/OpenAPI

Phase 2: Support Period (T+180 days)
- Both old and new versions work
- Clear migration documentation
- Support for questions

Phase 3: Sunset (T+180+ days)
- Stop accepting old version
- Return 410 Gone
- Direct users to migration guide

Example Timeline:
- March 1, 2026: v1 deprecated, v2 released
- September 1, 2026: v1 still works
- September 2, 2026: v1 no longer supported
```

### Deprecation Headers

```
Deprecation: true
Sunset: Sun, 01 Sep 2026 00:00:00 GMT
Link: <https://api.example.com/docs/v2>; rel="successor-version"
```

---

## Summary

✅ RESTful conventions (resource-oriented, collections, nesting)  
✅ Consistent naming (lowercase, hyphens, descriptive)  
✅ Proper HTTP methods (GET, POST, PUT, PATCH, DELETE)  
✅ Appropriate status codes (200s, 4xx, 5xx)  
✅ Standard response format (data, pagination, metadata)  
✅ Pagination and filtering (limit, offset, sort)  
✅ Versioning strategy (major versions in URL)  
✅ Standardized error responses (code, message, details)  
✅ Complete API documentation (OpenAPI/Swagger)  
✅ Rate limiting and authentication  
✅ Clear deprecation policy

---

**Last Updated**: April 2026  
**Version**: 1.0  
**Status**: Active
