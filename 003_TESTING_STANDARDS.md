# Testing Standards

## Table of Contents
1. [Testing Levels](#testing-levels)
2. [Coverage Targets](#coverage-targets)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Test Data Management](#test-data-management)
9. [Mock & Stub Strategies](#mock--stub-strategies)
10. [Test Naming Conventions](#test-naming-conventions)
11. [CI/CD Test Execution](#cicd-test-execution)
12. [Test Reporting](#test-reporting)

---

## Testing Levels

### Testing Pyramid

```
          E2E Tests (Slow, End-to-End)
         /            \
        /              \
    Integration Tests (Medium)
      /                    \
    /                        \
  Unit Tests (Fast, Many)
```

### Test Distribution

```
Unit Tests:      70% (~30,000 lines of test code)
Integration:     20% (~10,000 lines of test code)
E2E:             10% (~5,000 lines of test code)

Time Distribution:
Unit Tests:      ~20 seconds (fast)
Integration:     ~2 minutes (medium)
E2E:             ~5 minutes (slow)
Total:           ~7-10 minutes for full suite
```

---

## Coverage Targets

### Coverage Goals

```
Minimum acceptable: 80% code coverage
Target: 90% coverage
Flag: >50% coverage drop

By Component:
- Core business logic: 95%+
- Utility functions: 85%+
- API endpoints: 90%+
- Error handling: 100%
- External integrations: 80%+

Excluded from coverage:
- Third-party libraries
- Generated code
- Abstract base classes
- __init__.py files (usually)
```

### Coverage Measurement (Python)

```bash
# Run tests with coverage
pytest --cov=backend --cov-report=html --cov-report=term

# View coverage reports
coverage report

# Coverage thresholds
pytest --cov=backend --cov-fail-under=85
```

---

## Unit Testing

### Unit Test Structure (Python)

```python
import pytest
from unittest.mock import Mock, patch

class TestVideoAnalyzer:
    """Test suite for VideoAnalyzer class."""
    
    @pytest.fixture
    def analyzer(self):
        """Setup: Create analyzer instance."""
        return VideoAnalyzer(max_duration=3600)
    
    @pytest.fixture
    def sample_video(self):
        """Setup: Create sample video data."""
        return {
            "id": "vid_123",
            "filename": "test.mp4",
            "size": 1024 * 1024,
            "duration": 3600
        }
    
    # Happy path
    def test_analyze_video_success(self, analyzer, sample_video):
        """Test successful video analysis."""
        result = analyzer.analyze(sample_video)
        
        assert result["success"] is True
        assert result["video_id"] == "vid_123"
    
    # Error handling
    def test_analyze_oversized_video_fails(self, analyzer):
        """Test that oversized videos are rejected."""
        oversized = {"size": 10 * 1024 * 1024 * 1024}  # 10GB
        
        with pytest.raises(ValueError, match="exceeds maximum"):
            analyzer.analyze(oversized)
    
    # Parametrized tests
    @pytest.mark.parametrize("size,expected", [
        (100 * 1024 * 1024, True),      # 100MB - ok
        (500 * 1024 * 1024, True),      # 500MB - ok
        (1000 * 1024 * 1024, False),    # 1GB - too large
    ])
    def test_video_size_validation(self, analyzer, size, expected):
        """Test video size validation."""
        video = {"size": size}
        result = analyzer.is_valid_size(video)
        assert result == expected
    
    # Mocking
    @patch('video_service.transcribe')
    def test_analysis_with_mock(self, mock_transcribe, analyzer):
        """Test analysis using mocked transcription service."""
        # Setup mock
        mock_transcribe.return_value = {
            "transcript": "Hello world",
            "confidence": 0.95
        }
        
        # Test
        result = analyzer.analyze_with_transcription(sample_video)
        
        # Verify
        assert result["transcript"] == "Hello world"
        mock_transcribe.assert_called_once()
```

### Unit Test Best Practices

```python
# ✅ GOOD: Clear, focused test
def test_calculate_confidence_returns_mean():
    """Test confidence calculation."""
    predictions = [0.8, 0.85, 0.9]
    result = calculate_confidence(predictions)
    assert result == 0.85

# ❌ BAD: Unclear, testing multiple things
def test_stuff():
    """Test various things."""
    x = 5
    y = 10
    assert x + y == 15
    assert x * 2 == 10
    assert y / 5 == 2
```

---

## Integration Testing

### Integration Test Structure (Python)

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Use test database
TEST_DATABASE_URL = "sqlite:///test.db"
engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(bind=engine)

@pytest.fixture(scope="function")
def db():
    """Create test database."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db):
    """Create test client."""
    def override_get_db():
        return db
    
    app.dependency_overrides[get_db] = override_get_db
    return TestClient(app)

class TestVideoAPI:
    """Integration tests for video API."""
    
    def test_create_and_retrieve_video(self, client, db):
        """Test full workflow: create video and retrieve it."""
        # Create
        response = client.post("/api/v1/videos", json={
            "filename": "test.mp4",
            "title": "Test Video"
        })
        assert response.status_code == 201
        video_id = response.json()["id"]
        
        # Retrieve
        response = client.get(f"/api/v1/videos/{video_id}")
        assert response.status_code == 200
        assert response.json()["title"] == "Test Video"
    
    def test_concurrent_uploads(self, client):
        """Test handling concurrent uploads."""
        import concurrent.futures
        
        def upload_video(i):
            return client.post("/api/v1/videos", json={
                "filename": f"video_{i}.mp4",
                "title": f"Video {i}"
            })
        
        with concurrent.futures.ThreadPoolExecutor() as executor:
            results = list(executor.map(upload_video, range(5)))
        
        assert all(r.status_code == 201 for r in results)
```

---

## End-to-End Testing

### E2E Test Structure (JavaScript)

```javascript
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Video Upload E2E", () => {
  let testVideoId;
  const apiUrl = process.env.VITE_API_URL;

  beforeAll(async () => {
    // Setup: Create test user, authenticate
    const loginResponse = await fetch(`${apiUrl}/login`, {
      method: "POST",
      body: JSON.stringify({
        username: "test@example.com",
        password: "test_password"
      })
    });
    expect(loginResponse.ok).toBe(true);
  });

  it("should upload video and trigger transcription", async () => {
    // Step 1: Upload video
    const formData = new FormData();
    formData.append("file", new File(["video data"], "test.mp4"));

    const uploadResponse = await fetch(`${apiUrl}/videos/upload`, {
      method: "POST",
      body: formData
    });
    expect(uploadResponse.ok).toBe(true);
    
    testVideoId = awaituloadResponse.json().id;

    // Step 2: Verify upload
    const statusResponse = await fetch(`${apiUrl}/videos/${testVideoId}`);
    expect(statusResponse.ok).toBe(true);
    const video = await statusResponse.json();
    expect(video.status).toBe("processing");

    // Step 3: Wait for transcription
    let retries = 30;
    while (retries > 0) {
      const checkResponse = await fetch(`${apiUrl}/videos/${testVideoId}`);
      const current = await checkResponse.json();
      
      if (current.status === "completed") {
        expect(current.transcript).toBeTruthy();
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries--;
    }
  });

  afterAll(async () => {
    // Cleanup: Delete test video
    if (testVideoId) {
      await fetch(`${apiUrl}/videos/${testVideoId}`, { method: "DELETE" });
    }
  });
});
```

---

## Performance Testing

### Load Testing Example

```python
# requirements.txt
locust==2.12.0

# locustfile.py
from locust import HttpUser, task, between

class VideoAnalyticsUser(HttpUser):
    """Simulate video analytics user."""
    
    wait_time = between(1, 3)
    
    @task(3)
    def list_videos(self):
        """Task: List videos (weight=3, 75% of tasks)."""
        self.client.get("/api/v1/videos?limit=10")
    
    @task(1)
    def upload_video(self):
        """Task: Upload video (weight=1, 25% of tasks)."""
        with open("test_video.mp4", "rb") as f:
            self.client.post(
                "/api/v1/videos/upload",
                files={"file": f}
            )
    
    def on_start(self):
        """Login before starting tasks."""
        response = self.client.post("/api/v1/login", json={
            "username": "test@example.com",
            "password": "password"
        })
        self.token = response.json()["token"]
        self.client.headers.update(
            {"Authorization": f"Bearer {self.token}"}
        )
```

### Run Load Tests

```bash
# Run load test
locust -f locustfile.py --host=http://localhost:8000

# Headless mode
locust -f locustfile.py \
  --host=http://localhost:8000 \
  --users=100 \
  --spawn-rate=5 \
  --run-time=10m \
  --headless
```

---

## Security Testing

### Security Test Examples

```python
def test_sql_injection_prevented():
    """Test SQL injection is prevented."""
    malicious_input = "'; DROP TABLE users; --"
    
    with pytest.raises(InvalidInputError):
        fetch_user_by_email(malicious_input)

def test_xss_prevented():
    """Test XSS is prevented."""
    malicious_html = "<script>alert('xss')</script>"
    
    result = sanitize_output(malicious_html)
    assert "<script>" not in result
    assert "alert" not in result

def test_authentication_required():
    """Test endpoints require authentication."""
    response = client.get("/api/v1/admin/users")
    assert response.status_code == 401  # Unauthorized

def test_authorization_enforced():
    """Test user can only access their own data."""
    user_id = "user_123"
    other_user_id = "user_456"
    
    response = client.get(
        f"/api/v1/users/{other_user_id}",
        headers=get_auth_header(user_id)
    )
    assert response.status_code == 403  # Forbidden

def test_rate_limiting():
    """Test rate limiting is enforced."""
    for i in range(15):  # More than limit of 10
        response = client.post("/api/v1/login")
    
    assert response.status_code == 429  # Too Many Requests
```

---

## Test Data Management

### Test Fixtures & Factory Pattern

```python
from factory import Factory, Faker, SubFactory

class UserFactory(Factory):
    """Factory for creating test users."""
    class Meta:
        model = User
    
    id = Faker("uuid4")
    email = Faker("email")
    name = Faker("name")
    password_hash = "hashed_password"

class VideoFactory(Factory):
    """Factory for creating test videos."""
    class Meta:
        model = Video
    
    id = Faker("uuid4")
    title = Faker("sentence")
    owner = SubFactory(UserFactory)
    filename = Faker("file_name")
    status = "created"

# Usage
@pytest.fixture
def test_user():
    return UserFactory()

@pytest.fixture
def test_video(test_user):
    return VideoFactory(owner=test_user)

def test_video_belongs_to_user(test_video, test_user):
    assert test_video.owner_id == test_user.id
```

---

## Mock & Stub Strategies

### When to Mock

```python
# ✅ Mock external services
@patch('google.cloud.speech.SpeechClient')
def test_transcription(mock_speech):
    """Mock external Google Cloud service."""
    mock_speech.return_value.recognize.return_value = {
        "transcript": "Hello world"
    }
    
    result = transcribe_audio(audio_data)
    assert result["transcript"] == "Hello world"

# ✅ Mock slow operations
@patch('time.sleep')
def test_retry_logic(mock_sleep):
    """Mock sleep to speed up tests."""
    retry_with_backoff(operation)
    
    # Verify exponential backoff
    mock_sleep.assert_any_call(1)
    mock_sleep.assert_any_call(2)
    mock_sleep.assert_any_call(4)

# ❌ Don't mock the code under test
@patch('my_module.function_under_test')  # ❌ WRONG
def test_something(mock_func):
    pass
```

---

## Test Naming Conventions

### Naming Pattern: test_[what]_[scenario]_[expected]

```python
# ✅ Clear naming
def test_transcribe_with_valid_audio_returns_text():
    pass

def test_transcribe_with_invalid_format_raises_error():
    pass

def test_upload_with_oversized_file_returns_413():
    pass

# ❌ Unclear naming
def test_transcription():
    pass

def test_upload():
    pass

def test_video():
    pass
```

---

## CI/CD Test Execution

### GitHub Actions Test Pipeline

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: "3.11"
      
      - name: Install dependencies
        run: |
          pip install -r backend/requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://user:password@localhost/testdb
        run: |
          pytest backend/ \
            --cov=backend \
            --cov-fail-under=85 \
            --junit-xml=test-results.xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage.xml
      
      - name: Publish test results
        if: always()
        uses: EnricoMi/publish-unit-test-result-action@v2
        with:
          files: test-results.xml
```

---

## Test Reporting

### Test Report Format

```
Test Results Summary:
========================
Total Tests:        1,234
Passed:             1,210 ✓
Failed:             20   ✗
Skipped:            4
Coverage:           87.5%

By Category:
  Unit Tests:       1,100 passed  (87%)
  Integration:      100 passed    (98%)
  E2E Tests:        10 failed     (50%)

Failed Tests:
========================
1. test_video_upload_timeout - VideoUploadError: timeout after 30s
2. test_transcription_api - APIError: 503 Service Unavailable
...

Slowest Tests:
========================
1. test_e2e_full_workflow - 15.2s
2. test_concurrent_load - 12.8s
3. test_database_migration - 8.5s
```

---

**Last Updated**: April 2026  
**Version**: 1.0  
**Status**: Active
