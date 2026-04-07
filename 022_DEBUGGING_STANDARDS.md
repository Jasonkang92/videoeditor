# Debugging Gold Standards

## Table of Contents
1. [Debugging Philosophy](#debugging-philosophy)
2. [Debugger Setup & Configuration](#debugger-setup--configuration)
3. [Strategic Logging for Diagnostics](#strategic-logging-for-diagnostics)
4. [Error Reproduction](#error-reproduction)
5. [Profiling & Performance Debugging](#profiling--performance-debugging)
6. [Breakpoint Strategies](#breakpoint-strategies)
7. [Test-Driven Debugging](#test-driven-debugging)
8. [Browser DevTools](#browser-devtools)
9. [Common Debugging Patterns](#common-debugging-patterns)
10. [Debugging Productivity Tips](#debugging-productivity-tips)

---

## Debugging Philosophy

### Debugging vs Error Handling

| Aspect | Debugging | Error Handling |
|--------|-----------|-----------------|
| **When** | Development-time (finding bugs) | Runtime (managing exceptions) |
| **Focus** | How did bug happen? | How does app recover? |
| **Tools** | Debuggers, logs, profilers | Try/catch, circuit breakers, alerts |
| **Goal** | Fix the code | Keep app stable despite errors |

### Debugging Mindset

**Follow the data, not hunches:**

```python
# ❌ Wrong: Guess and check
def calculate_discount(price):
    result = price * 0.8  # Why 0.8? Maybe bug is here?
    return result

# ✅ Right: Trace values and verify assumptions
def calculate_discount(price):
    # Q: Where does price come from?
    # Q: What value is it?
    # Q: Is it what we expect?
    logger.debug(f"Input price: {price}, type: {type(price)}")
    
    discount_rate = 0.2  # 20% discount
    result = price * (1 - discount_rate)
    
    logger.debug(f"Output: {result}")
    return result
```

---

## Debugger Setup & Configuration

### Python: debugpy (VS Code)

**Install:**
```bash
pip install debugpy
```

**.vscode/launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["main:app", "--reload"],
      "jinja": true,
      "justMyCode": false,
      "stopOnEntry": false,
      "console": "integratedTerminal",
      "cwd": "${workspaceFolder}/backend"
    },
    {
      "name": "Python: pytest",
      "type": "python",
      "request": "launch",
      "module": "pytest",
      "args": ["-vv", "${file}"],
      "console": "integratedTerminal",
      "justMyCode": false
    }
  ]
}
```

**Usage (VS Code):**
1. Click line number to set breakpoint (red dot appears)
2. Press F5 to start debugging
3. Code pauses at breakpoint
4. Inspect variables in Debug pane
5. Step over (F10), step into (F11), continue (F5)

### JavaScript/TypeScript: VS Code Built-in

**.vscode/launch.json:**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Edge",
      "type": "msedge",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend",
      "preLaunchTask": "npm: dev"
    }
  ]
}
```

**Usage:**
1. Press F5 to start debugging
2. Browser opens with DevTools attached
3. Set breakpoints in VS Code
4. Code pauses and you inspect in VS Code

### Remote Debugging

```python
# backend/main.py - Enable remote debugging
import debugpy

# Listen for debugger connection
debugpy.listen(("0.0.0.0", 5678))
print("Waiting for debugger to attach...")
debugpy.wait_for_client()

# Now app waits for debugger to connect before running
```

**VS Code (remote attach):**
```json
{
  "name": "Python: Attach to Remote",
  "type": "python",
  "request": "attach",
  "host": "localhost",
  "port": 5678,
  "pathMapping": {
    "/app": "${workspaceFolder}/backend"
  }
}
```

---

## Strategic Logging for Diagnostics

### Logging Levels for Debugging

```python
import logging

logger = logging.getLogger(__name__)

# ✅ Good: Appropriate levels
def process_video(video_id: str) -> str:
    # DEBUG: Trace execution path
    logger.debug(f"Processing video {video_id}")
    
    # INFO: Normal operation
    logger.info(f"Starting transcription for {video_id}")
    
    try:
        result = transcribe(video_id)
    except TimeoutError as e:
        # WARNING: Recoverable issue
        logger.warning(f"Transcription timeout for {video_id}, retrying")
        result = retry_transcribe(video_id)
    except Exception as e:
        # ERROR: Something went wrong
        logger.error(f"Failed to transcribe {video_id}: {e}", exc_info=True)
        raise
    
    logger.debug(f"Video {video_id} processing complete")
    return result
```

### Structured Logging for Debugging

```python
# ✅ Good: Structured logs for filtering
logger.info(
    "video_analysis_started",
    extra={
        "video_id": video_id,
        "user_id": user_id,
        "analysis_type": analysis_type,
        "timestamp": datetime.now().isoformat(),
    }
)

# Then query logs:
# logs | where video_id == "vid_123" | sort timestamp
```

### Contextual Logging

```python
from structlog import get_logger
import structlog

# ✅ Bind context that persists
structlog.configure(
    processors=[
        structlog.processors.JSONRenderer()
    ]
)

logger = structlog.get_logger()

def analyze_video(video_id: str, user_id: str):
    # Bind context
    bound_logger = logger.bind(video_id=video_id, user_id=user_id)
    
    # All logs now include video_id and user_id
    bound_logger.info("analysis_started")
    
    try:
        result = _analyze(video_id)
        bound_logger.info("analysis_complete", result=result)
    except Exception as e:
        bound_logger.error("analysis_failed", error=str(e))
        raise
```

---

## Error Reproduction

### Creating Minimal Reproducible Example (MRE)

```python
# ❌ Too complex: Hard to debug
def test_broken():
    # Setup: 200 lines of test data
    users = create_100_test_users()
    videos = create_1000_test_videos()
    analyses = create_complex_nested_data()
    
    # Action: Buried in complexity
    result = do_something_with_all_data()
    
    # Assertion: Fails but why?
    assert result is not None

# ✅ Minimal: Only necessary parts
def test_video_analysis_timeout():
    # Setup: Absolute minimum
    video = {"id": "vid_123", "duration": 3600}  # 1 hour video
    
    # Action: Clear what we're testing
    with pytest.raises(TimeoutError):
        analyze_video(video, timeout_seconds=1)
    
    # Assertion: Clear what we expect
    # Video >60min should timeout with 1s limit
```

### Reproducing Production Bugs

```python
# Step 1: Capture production error
# From logs: user_id=456, video_id=vid_789, error=TranscriptionError

# Step 2: Write failing test
def test_reproduction_user_456_video_789():
    """Bug: Transcription fails for specific video. See issue #567."""
    user_id = 456
    video_id = "vid_789"
    
    # This should fail with same error as production
    with pytest.raises(TranscriptionError):
        analyze_video(video_id, user_id)

# Step 3: Fix code to make test pass
# Now you know fix works AND won't regress

# Step 4: Keep test permanent
# Prevents regression in future
```

### Trace Execution with Logging

```python
# ✅ Breadcrumb trail of execution
def complex_calculation(a: int, b: int) -> int:
    logger.debug(f"Enter: complex_calculation({a}, {b})")
    
    step1 = a + b
    logger.debug(f"Step 1 (a+b): {step1}")
    
    step2 = step1 * 2
    logger.debug(f"Step 2 (×2): {step2}")
    
    if step2 > 100:
        logger.debug(f"Step 3 branch: step2 ({step2}) > 100")
        result = step2 // 10
    else:
        logger.debug(f"Step 3 branch: step2 ({step2}) <= 100")
        result = step2 * 10
    
    logger.debug(f"Exit: result={result}")
    return result

# Run with DEBUG logging, see every step
```

---

## Profiling & Performance Debugging

### Python: cProfile

```python
import cProfile
import pstats

# Profile function
def slow_function():
    # expensive operation
    pass

# Run profiler
profiler = cProfile.Profile()
profiler.enable()

slow_function()

profiler.disable()
stats = pstats.Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats(10)  # Top 10 slowest

# Output shows:
# ncalls: How many times called
# cumtime: Total time in function
# percall: Average time per call
```

### JavaScript: Performance API

```javascript
// ✅ Measure specific operations
const start = performance.now();

// Operation to measure
const result = processLargeArray(array);

const duration = performance.now() - start;
console.log(`processLargeArray took ${duration.toFixed(2)}ms`);

// Mark & measure with names
performance.mark('video-analysis-start');

await analyzeVideo(video);

performance.mark('video-analysis-end');
performance.measure('video-analysis', 'video-analysis-start', 'video-analysis-end');

// Get the measurement
const measure = performance.getEntriesByName('video-analysis')[0];
console.log(`Analysis took ${measure.duration.toFixed(2)}ms`);
```

### Finding Memory Leaks

```typescript
// ✅ Track object creation
let instances = 0;

class VideoProcessor {
  constructor() {
    instances++;
    console.log(`VideoProcessor created. Total: ${instances}`);
  }
  
  cleanup() {
    instances--;
    console.log(`VideoProcessor destroyed. Total: ${instances}`);
  }
}

// Track if instances keep growing
setInterval(() => {
  console.log(`Active instances: ${instances}`);
}, 1000);

// If instances > 0 after cleanup, memory leak!
```

---

## Breakpoint Strategies

### Conditional Breakpoints

```python
# ✅ Break only when condition true
# In VS Code: Right-click breakpoint → Edit Breakpoint
# Expression: video_id == "vid_123_problematic"

# Now debugger pauses only for that specific video
# Avoid stopping for every call
```

### Logpoints (Log Without Breaking)

```javascript
// ✅ Log message when condition met (no pause)
// VS Code Debugging: Right-click → Add Logpoint
// Message: "Video processing: {video_id}"

// Logs message every time code reached
// No pause, doesn't slow execution much
```

### Hit Count Breakpoints

```python
# ✅ Break on nth occurrence
# Breakpoint condition: hitCount % 100 == 0

# Useful for loops that iterate 1000x
# Only pause every 100th iteration
```

### Breakpoint Best Practices

```
✅ DO:
- Use conditional breakpoints (not every iteration)
- Remove when done (avoid committing breakpoints)
- Use logging/logpoints when possible
- Know watchlist targets (what to inspect)

❌ DON'T:
- Leave breakpoints in code commits
- Break on every loop iteration (too slow)
- Set complex conditions (slow evaluation)
- Rely on breakpoints in production
```

---

## Test-Driven Debugging

### TDD Debugging Workflow

1. **Reproduce bug with failing test:**
```python
def test_transcription_timeout_on_long_video():
    """Bug: 1-hour videos timeout. See issue #567."""
    long_video = create_test_video(duration_seconds=3600)
    
    with pytest.raises(TimeoutError):
        analyze_video(long_video)  # This fails - good!
```

2. **Debug while test runs:**
```bash
# Run test with debugger
pytest -vv test_debug.py::test_transcription_timeout_on_long_video --pdb

# Debugger pauses at failure, inspect state
```

3. **Identify root cause:**
```python
# In debugger, inspect variables:
# - transcription_timeout = 30  # Too short!
# - video_duration = 3600       # 1 hour
```

4. **Fix the issue:**
```python
# Increase timeout proportional to video length
timeout = max(30, video.duration_seconds / 10)  # 30s min, scale with duration
```

5. **Verify test passes:**
```bash
pytest -vv test_debug.py::test_transcription_timeout_on_long_video
# PASSED ✓
```

---

## Browser DevTools

### Console Debugging

```javascript
// ✅ Strategic console logs
function analyzeVideo(video) {
  console.log('analyzeVideo called with:', video);
  
  try {
    const result = performAnalysis(video);
    console.log('Analysis result:', result);
    return result;
  } catch (error) {
    console.error('Analysis failed:', error);
    console.trace();  // Show stack trace
    throw error;
  }
}

// Filter in console:
// Click filter → select "Verbose" to see all
// Or type in search box
```

### Network Tab Debugging

```javascript
// ✅ Check API calls
// DevTools → Network → Look for failed requests
// - Status codes (200, 400, 500, etc.)
// - Response time
// - Request payload
// - Response data

// Common issues:
// - 401: Not authenticated
// - 403: Not authorized
// - 404: Endpoint not found
// - 500: Server error
// - Timeout: Request took too long
```

### React DevTools

```javascript
// ✅ Inspect component state
// Chrome: DevTools → React tab
// - Component tree
- Props inspection
// - State values
// - Re-render tracking

// Profiler tab shows:
// - Which components re-render
// - How long renders take
// - Why component re-rendered
```

---

## Common Debugging Patterns

### Pattern: Mystery Variable Value

```python
# ❌ Mystery: What's in this variable?
def process_user_data(user_dict):
    email = user_dict['email']
    # ... later ...
    if '@' not in email:  # Fails!
        # What was email value?

# ✅ Solution: Log before use
def process_user_data(user_dict):
    logger.debug(f"user_dict keys: {user_dict.keys()}")
    logger.debug(f"user_dict: {user_dict}")
    
    email = user_dict.get('email')  # Use .get() instead of []
    logger.debug(f"email value: {repr(email)}, type: {type(email)}")
    
    if email and '@' in email:
        # Now you're confident
```

### Pattern: Function Doesn't Return Expected Value

```python
# ❌ Dead code? Not called? Wrong branch?
def get_user_email(user_id):
    user = find_user(user_id)
    if user:
        return user.email
    # Missing: else return None (implicit)

# ✅ Solution: Add logging at decision points
def get_user_email(user_id):
    logger.debug(f"Getting email for user {user_id}")
    
    user = find_user(user_id)
    logger.debug(f"Found user: {user}")
    
    if user:
        email = user.email
        logger.debug(f"Returning email: {email}")
        return email
    
    logger.debug("User not found, returning None")
    return None
```

### Pattern: Integration Test Fails, Unit Tests Pass

```python
# ❌ Problem: Works alone, fails together
# Unit test: Mocks everything → PASS
# Integration test: Real services → FAIL

# ✅ Solution: Logs to identify integration issue
def test_integration_video_analysis():
    logger.info("Starting integration test")
    
    # Check each service
    assert db.is_connected(), "Database not connected"
    logger.info("✓ Database connected")
    
    assert redis.is_connected(), "Redis not connected"
    logger.info("✓ Redis connected")
    
    result = integrated_analyze_video(video_id)
    logger.info(f"Analysis complete: {result}")
    
    assert result is not None
```

---

## Debugging Productivity Tips

### Quick Debug Checklist

```
[ ] Reproduce bug consistently
[ ] Write failing test to reproduce
[ ] Enable DEBUG logging
[ ] Check most recent code change
[ ] Look at git diff of recent changes
[ ] Check error stack trace carefully
[ ] Inspect variables at failure point
[ ] Compare expected vs actual values
[ ] Check related code for similar bugs
[ ] Write fix
[ ] Verify test passes
```

### Debugging Shortcuts (VS Code)

```
F5            Start debugging
F10           Step over (skip function)
F11           Step into (enter function)
Shift+F11     Step out (exit function)
Ctrl+Shift+D  Open Debug view
Ctrl+K Ctrl+I Quick Info (hover)
Ctrl+Alt+V    Evaluate expression
```

### When Stuck

1. **Take a break** — Fresh eyes catch obvious issues
2. **Explain to rubber duck** — Verbalize the bug (often reveals it)
3. **Check assumptions** — What are you assuming is true?
4. **Add more logs** — Trace execution step-by-step
5. **Isolate problem** — Test individual parts
6. **Ask for help** — Second opinion often helps
7. **Review history** — When did this start working?

### Preventing Bugs (Debugging Prevention)

```python
# ✅ Good code is easier to debug
# - Type hints catch errors early
# - Assertions check assumptions
# - Tests catch regressions
# - Clear variable names avoid confusion
# - Small functions = easier to debug

# Example: Type-safe debugging
def process_video(
    video_id: str,
    timeout_seconds: int = 300
) -> str:  # Clear return type
    """Process video with timeout in seconds."""
    # Type checker catches wrong types before runtime
    assert timeout_seconds > 0, "Timeout must be positive"
    # ...
```

---

## Related Standards
- [007_ERROR_HANDLING_STANDARDS.md](007_ERROR_HANDLING_STANDARDS.md)
- [003_TESTING_STANDARDS.md](003_TESTING_STANDARDS.md)
- [002_LOGGING_MONITORING_STANDARDS.md](002_LOGGING_MONITORING_STANDARDS.md)
- [008_PERFORMANCE_OPTIMIZATION_STANDARDS.md](008_PERFORMANCE_OPTIMIZATION_STANDARDS.md)
- [011_PYTHON_CODING_STANDARDS.md](011_PYTHON_CODING_STANDARDS.md)
- [012_JAVASCRIPT_CODING_STANDARDS.md](012_JAVASCRIPT_CODING_STANDARDS.md)

---

**Last Updated:** April 2026
**Status:** Gold Standard
