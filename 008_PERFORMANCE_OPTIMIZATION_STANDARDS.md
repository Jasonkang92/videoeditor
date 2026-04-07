# Performance & Optimization Standards

## Table of Contents
1. [Performance Targets & SLAs](#performance-targets--slas)
2. [Frontend Performance](#frontend-performance)
3. [Backend Performance](#backend-performance)
4. [Database Performance](#database-performance)
5. [Caching Strategies](#caching-strategies)
6. [Load Testing](#load-testing)
7. [APM & Profiling](#apm--profiling)
8. [Optimization Checklist](#optimization-checklist)

---

## Performance Targets & SLAs

### Service Level Agreements

```
API Response Times:
- p50 (median): < 200ms
- p95 (95th percentile): < 500ms
- p99 (99th percentile): < 1000ms
- Max (worst case): < 5000ms

Availability:
- Uptime target: 99.9% (8.76 hours downtime/year)
- Error rate: < 0.1%
- Request success rate: > 99.9%

Transcription Performance:
- Average latency: 1 minute for 1 hour video
- Processing throughput: 100+ videos/hour
- Success rate: > 98%

Database Performance:
- Query latency (p95): < 100ms
- Connection pool utilization: < 80%
- Long transaction: < 30 seconds
```

---

## Frontend Performance

### Bundle Size Targets

```
JavaScript Bundle:
- Initial load: < 200KB (gzipped)
- Per page load: < 50KB additional
- Total: < 500KB all pages combined

CSS: < 50KB (gzipped)
Images: Optimized, WebP format where possible
Fonts: System fonts or 1-2 optimized font families

Lighthouse Scores:
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90
```

### Frontend Optimization

```javascript
// ✅ Code splitting
const VideoAnalyzer = React.lazy(() => import('./pages/VideoAnalyzer'));

// ✅ Image optimization
<img src="image.gif" srcSet="image-320w.png 320w, image-640w.png 640w" />

// ✅ Minify CSS/JS (Vite does this automatically)

// ✅ Preload critical resources
<link rel="preload" as="script" href="critical.js" />

// ✅ Lazy load images
<img loading="lazy" src="below-fold.jpg" />

// ✅ Use Web Workers for heavy computation
const worker = new Worker('heavy-compute.js');
```

---

## Backend Performance

### API Endpoint Targets

```
Video Upload (multipart):
- Target: < 500ms for metadata parsing
- Limits: 500MB per file, 10MB/s upload

Video Transcription:
- Target: 1 minute per hour of audio
- Concurrency: 10+ simultaneous transcriptions

List Endpoints:
- Target: < 100ms for 10 items
- Pagination: Max 100 items per request

Search:
- Target: < 500ms for typical queries
- Index: All searchable fields
```

### Python Backend Optimization

```python
# ✅ Use async/await
@app.get("/api/v1/videos")
async def list_videos(skip: int = 0, limit: int = 10):
    videos = await db.execute(query)
    return videos

# ✅ Connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10
)

# ✅ Query optimization
videos = await db.query(Video)\
    .filter(Video.owner_id == user_id)\
    .options(selectinload(Video.owner))\  # Eager load
    .limit(10)\
    .all()

# ✅ Caching
@cached(cache=TTLCache(maxsize=1000, ttl=3600))
def get_user_preferences(user_id):
    return fetch_from_db(user_id)

# ✅ Background tasks
@app.post("/upload")
async def upload_video(file: UploadFile):
    background_tasks.add_task(process_video, file.filename)
    return {"status": "queued"}
```

---

## Database Performance

### Query Optimization

```sql
-- ❌ Bad: N+1 query problem
SELECT * FROM videos;
-- Then: SELECT * FROM users WHERE id = ?

-- ✅ Good: Join
SELECT v.*, u.name 
FROM videos v 
JOIN users u ON v.owner_id = u.id;

-- ✅ Good: Pagination
SELECT * FROM videos LIMIT 10 OFFSET 0;

-- ✅ Good: Indexes on frequently filtered columns
CREATE INDEX idx_videos_owner_id ON videos(owner_id);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);

-- ✅ Use EXPLAIN to analyze
EXPLAIN ANALYZE
SELECT * FROM videos WHERE owner_id = 123 ORDER BY created_at DESC;
```

---

## Caching Strategies

### Three-Tier Caching

```
Frontend Cache:
- Browser cache (.css, .js, images)
- Service Worker for offline support
- Session storage for temporary state

API Cache Layer:
- Redis for frequently accessed data
- TTL: 3600 seconds (1 hour)
- Invalidate on update

Database Query Cache:
- Query results cached in-memory
- SQLAlchemy query cache
- Invalidate on table changes
```

### Redis Caching (Python)

```python
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Cache with TTL
def cache_user_data(user_id, data, ttl=3600):
    """Cache user data in Redis."""
    key = f"user:{user_id}"
    redis_client.setex(key, ttl, json.dumps(data))

# Retrieve from cache
def get_cached_user(user_id):
    """Get user from cache."""
    key = f"user:{user_id}"
    cached = redis_client.get(key)
    return json.loads(cached) if cached else None

# Cache-aside pattern
async def get_user(user_id):
    """Fetch user with caching."""
    # Try cache first
    cached = get_cached_user(user_id)
    if cached:
        return cached
    
    # Miss: fetch from database
    user = await db.query(User).get(user_id)
    
    # Store in cache
    cache_user_data(user_id, user.dict())
    
    return user

# Invalidate on update
def update_user(user_id, data):
    """Update user and invalidate cache."""
    user = update_db(user_id, data)
    redis_client.delete(f"user:{user_id}")  # Invalidate
    return user
```

---

## Load Testing

### Locust Load Tests

```python
# locustfile.py
from locust import HttpUser, task, between

class VideoAnalyticsUser(HttpUser):
    """Simulate typical user behavior."""
    
    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks
    
    @task(5)
    def list_videos(self):
        """List videos (weight=5, 50% of tasks)."""
        self.client.get("/api/v1/videos?limit=10")
    
    @task(3)
    def upload_video(self):
        """Upload video (weight=3, 30% of tasks)."""
        with open("test_video.mp4", "rb") as f:
            self.client.post("/api/v1/videos/upload", files={"file": f})
    
    @task(2)
    def get_transcription(self):
        """Get transcription (weight=2, 20% of tasks)."""
        self.client.get("/api/v1/videos/123/transcription")
```

###  Run Load Test

```bash
# Start load test with web UI
locust -f locustfile.py --host=http://localhost:8000

# Headless mode with specific parameters
locust -f locustfile.py \
  --host=http://localhost:8000 \
  --users=100 \               # 100 concurrent users
  --spawn-rate=10 \            # Spawn 10 users per second
  --run-time=5m \              # Run for 5 minutes
  --headless

# View results
# Requests/sec, Response times, Error rate
```

---

## APM & Profiling

### Application Performance Monitoring

```python
# Using DataDog
from ddtrace import tracer, patch

patch(requests=True)
patch(httpx=True)

# Manual tracing
@tracer.wrap()
def expensive_operation():
    pass

# Automatic tracing of slowqueries
@tracer.wrap(service="video-api", resource="process_video")
async def process_video(video_id):
    pass
```

### Python Profiling

```bash
# Profile with cProfile
python -m cProfile -s cumtime -m main

# Use py-spy for production profiling
pip install py-spy
py-spy record -o profile.svg -d 60 -p $PID

# Analyze with Flame Graph
# Convert SVG to interactive visualization
```

---

## Optimization Checklist

- [ ] Frontend bundle size < 200KB (gzipped)
- [ ] JavaScript minified and bundled
- [ ] CSS minified
- [ ] Images optimized (WebP, correct sizes)
- [ ] Fonts: System fonts or minimal custom fonts
- [ ] API response times < 500ms p95
- [ ] Database queries optimized (< 100ms)
- [ ] Proper indexes on frequently filtered columns
- [ ] Connection pooling configured
- [ ] Caching layer implemented (Redis)
- [ ] API rate limiting configured
- [ ] CDN for static assets
- [ ] Gzip compression enabled
- [ ] Database query pagination implemented
- [ ] Long operations offloaded to background jobs
- [ ] Load tested (100+ concurrent users)
- [ ] Lighthouse score > 90
- [ ] Error rate < 0.1%
- [ ] 99.9% uptime SLA achievable

---

**Last Updated**: April 2026  
**Version**: 1.0  
**Status**: Active
