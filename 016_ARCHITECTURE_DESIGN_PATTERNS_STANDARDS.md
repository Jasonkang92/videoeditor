# Architecture & Design Patterns Gold Standards

## Table of Contents
1. [Architectural Principles](#architectural-principles)
2. [Layered Architecture](#layered-architecture)
3. [Service Layer Pattern](#service-layer-pattern)
4. [Repository Pattern](#repository-pattern)
5. [Factory Pattern](#factory-pattern)
6. [Singleton Pattern](#singleton-pattern)
7. [Observer Pattern](#observer-pattern)
8. [Strategy Pattern](#strategy-pattern)
9. [Dependency Injection](#dependency-injection)
10. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## Architectural Principles

### SOLID Principles

**S - Single Responsibility Principle**
```python
# ✅ Single responsibility
class VideoUploadService:
    """Handles only video upload logic."""
    async def upload(self, file: File) -> str:
        # Upload only
        
class VideoAnalyzer:
    """Handles only analysis logic."""
    async def analyze(self, video_id: str) -> str:
        # Analyze only

# ❌ Wrong: Multiple responsibilities
class VideoManager:
    async def upload(self, file: File) -> str:
        # Upload
    async def analyze(self, video_id: str) -> str:
        # Analyze
    async def delete(self, video_id: str) -> None:
        # Delete
```

**O - Open/Closed Principle**
```python
# ✅ Open for extension, closed for modification
from abc import ABC, abstractmethod

class Analyzer(ABC):
    @abstractmethod
    async def analyze(self, video_id: str) -> str:
        pass

class TranscriptionAnalyzer(Analyzer):
    async def analyze(self, video_id: str) -> str:
        # Transcription implementation
        
class TranslationAnalyzer(Analyzer):
    async def analyze(self, video_id: str) -> str:
        # Translation implementation

# New analyzer doesn't modify existing code
```

**L - Liskov Substitution Principle**
```python
# ✅ Subtypes are substitutable for base types
class CacheService(ABC):
    @abstractmethod
    def get(self, key: str) -> Any:
        pass

class RedisCache(CacheService):
    def get(self, key: str) -> Any:
        # Works exactly like CacheService contract
        
class MemoryCache(CacheService):
    def get(self, key: str) -> Any:
        # Can swap with RedisCache without breaking code
```

**I - Interface Segregation Principle**
```typescript
// ✅ Specific interfaces
interface VideoUploader {
  upload(file: File): Promise<string>;
}

interface VideoAnalyzer {
  analyze(videoId: string): Promise<AnalysisResult>;
}

// Don't force classes to depend on unused methods
class S3VideoUpload implements VideoUploader {
  upload(file: File): Promise<string> { /* ... */ }
}

// ❌ Wrong: Large interface with unused methods
interface VideoService {
  upload(file: File): Promise<string>;
  analyze(videoId: string): Promise<AnalysisResult>;
  delete(videoId: string): Promise<void>;
  // ... many more methods
}
```

**D - Dependency Inversion Principle**
```python
# ✅ Depend on abstractions, not concrete implementations
from abc import ABC, abstractmethod

class StorageService(ABC):
    @abstractmethod
    async def save(self, key: str, data: bytes) -> None:
        pass

class VideoAnalyzer:
    def __init__(self, storage: StorageService):
        self.storage = storage  # Abstraction
    
    async def analyze(self, video_id: str) -> str:
        # Use storage via interface
        await self.storage.save(f"analysis_{video_id}", data)

# Implementation can change without modifying VideoAnalyzer
class S3StorageService(StorageService):
    async def save(self, key: str, data: bytes) -> None:
        # S3 implementation
        
class LocalStorageService(StorageService):
    async def save(self, key: str, data: bytes) -> None:
        # Local file implementation
```

---

## Layered Architecture

### Backend Structure

```
backend/
├── api/                    # HTTP endpoints
│   ├── routes/
│   │   ├── videos.py
│   │   ├── analysis.py
│   │   └── users.py
│   ├── schemas.py         # Request/response schemas
│   └── dependencies.py    # FastAPI dependencies
├── services/              # Business logic
│   ├── video_service.py
│   ├── analysis_service.py
│   └── user_service.py
├── repositories/          # Data access
│   ├── video_repository.py
│   ├── analysis_repository.py
│   └── user_repository.py
├── models/                # Database models
│   └── models.py
├── schemas/               # Pydantic models
│   └── schemas.py
├── config/                # Configuration
│   ├── settings.py
│   └── database.py
└── main.py                # App entry point
```

### Frontend Structure

```
frontend/src/
├── api/                   # API client layer
│   ├── client.ts
│   ├── videos.api.ts
│   └── analysis.api.ts
├── pages/                 # Page components
│   ├── VideosPage.tsx
│   └── AnalysisPage.tsx
├── components/            # Reusable components
│   ├── VideoPlayer.tsx
│   ├── AnalysisForm.tsx
│   └── ResultDisplay.tsx
├── hooks/                 # Custom hooks
│   ├── useVideos.ts
│   └── useAnalysis.ts
├── store/                 # State management
│   ├── videoStore.ts
│   └── analysisStore.ts
├── types/                 # TypeScript types
│   ├── api.types.ts
│   └── domain.types.ts
└── App.tsx                # Root component
```

---

## Service Layer Pattern

### Purpose
Encapsulate business logic separate from HTTP/database concerns.

```python
# ✅ Service layer handles business logic
class VideoAnalysisService:
    """Business logic for video analysis."""
    
    def __init__(
        self,
        video_repo: VideoRepository,
        analysis_repo: AnalysisRepository,
        external_api: ExternalAnalysisAPI,
    ):
        self.video_repo = video_repo
        self.analysis_repo = analysis_repo
        self.external_api = external_api
    
    async def analyze_video(self, video_id: str, analysis_type: str) -> AnalysisResult:
        """
        Orchestrate video analysis workflow.
        Handles validation, sequencing, error recovery.
        """
        # Get video
        video = await self.video_repo.get(video_id)
        if not video:
            raise VideoNotFoundError(video_id)
        
        # Check if already analyzed
        existing = await self.analysis_repo.find_by_video_and_type(
            video_id, analysis_type
        )
        if existing:
            return existing
        
        # Create analysis record
        analysis = await self.analysis_repo.create(
            VideoAnalysis(video_id=video_id, type=analysis_type, status='processing')
        )
        
        try:
            # Call external service with retry logic
            result = await self._call_with_retry(
                self.external_api.analyze,
                video.file_path,
                analysis_type,
            )
            
            # Update analysis result
            await self.analysis_repo.update(analysis.id, {
                'status': 'complete',
                'result': result,
            })
            
            return await self.analysis_repo.get(analysis.id)
        except Exception as e:
            # Handle error
            await self.analysis_repo.update(analysis.id, {
                'status': 'failed',
                'error': str(e),
            })
            raise
```

### API Layer Calls Service

```python
# ✅ API routes delegate to service
@router.post("/api/videos/{video_id}/analyze")
async def analyze_video(
    video_id: str,
    request: AnalysisRequest,
    service: VideoAnalysisService = Depends(),
):
    """HTTP endpoint delegates to service."""
    try:
        result = await service.analyze_video(video_id, request.analysis_type)
        return AnalysisResponse.from_model(result)
    except VideoNotFoundError:
        raise HTTPException(status_code=404, detail="Video not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Analysis failed")
```

---

## Repository Pattern

### Purpose
Abstract data access from business logic.

```python
# ✅ Repository interface
from abc import ABC, abstractmethod

class VideoRepository(ABC):
    @abstractmethod
    async def get(self, video_id: str) -> Optional[Video]:
        """Get video by ID."""
    
    @abstractmethod
    async def list(self, user_id: str, limit: int = 10) -> List[Video]:
        """List user's videos."""
    
    @abstractmethod
    async def create(self, video: Video) -> Video:
        """Save new video."""
    
    @abstractmethod
    async def update(self, video_id: str, updates: dict) -> Video:
        """Update video."""

# ✅ Implementation for PostgreSQL
class SQLVideoRepository(VideoRepository):
    def __init__(self, db: Session):
        self.db = db
    
    async def get(self, video_id: str) -> Optional[Video]:
        return self.db.query(VideoModel).filter(
            VideoModel.id == video_id
        ).first()
    
    async def list(self, user_id: str, limit: int = 10) -> List[Video]:
        return self.db.query(VideoModel).filter(
            VideoModel.user_id == user_id
        ).limit(limit).all()
```

---

## Factory Pattern

### Purpose
Create objects without specifying exact classes.

```python
# ✅ Factory for creating analyzers
class AnalyzerFactory:
    _analyzers = {
        'transcription': TranscriptionAnalyzer,
        'translation': TranslationAnalyzer,
        'summarization': SummarizationAnalyzer,
    }
    
    @staticmethod
    def create(analysis_type: str) -> Analyzer:
        if analysis_type not in AnalyzerFactory._analyzers:
            raise ValueError(f"Unknown analyzer: {analysis_type}")
        
        return AnalyzerFactory._analyzers[analysis_type]()

# Usage: Don't need to know concrete class
analyzer = AnalyzerFactory.create('transcription')
result = await analyzer.analyze(video_id)
```

```typescript
// ✅ TypeScript factory pattern
interface Processor {
  process(data: string): Promise<string>;
}

class ProcessorFactory {
  static create(type: 'transcription' | 'translation' | 'summarization'): Processor {
    switch (type) {
      case 'transcription':
        return new TranscriptionProcessor();
      case 'translation':
        return new TranslationProcessor();
      case 'summarization':
        return new SummarizationProcessor();
    }
  }
}
```

---

## Singleton Pattern

### Purpose
Ensure single instance of a class.

```python
# ✅ Singleton for database connection
from threading import Lock

class Database:
    _instance = None
    _lock = Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        self.connection = create_connection()
        self._initialized = True

# Only one instance throughout app
db = Database()
```

**Note:** Prefer dependency injection over singleton for testability:

```python
# ✅ Better: Dependency injection
class AppSettings:
    db: Database
    cache: CacheService

@app.on_event("startup")
def initialize():
    settings.db = Database()  # Single instance managed by app
    settings.cache = RedisCache()
```

---

## Observer Pattern

### Purpose
Notify multiple components of state changes.

```python
# ✅ Observer pattern for events
from typing import Callable, List

class VideoAnalysisEvent:
    class Observer(ABC):
        @abstractmethod
        def on_analysis_complete(self, video_id: str, result: str):
            pass

class VideoAnalysisService:
    def __init__(self):
        self._observers: List[VideoAnalysisEvent.Observer] = []
    
    def subscribe(self, observer: VideoAnalysisEvent.Observer):
        self._observers.append(observer)
    
    def unsubscribe(self, observer: VideoAnalysisEvent.Observer):
        self._observers.remove(observer)
    
    async def analyze_video(self, video_id: str) -> str:
        result = await self._do_analysis(video_id)
        
        # Notify all observers
        for observer in self._observers:
            observer.on_analysis_complete(video_id, result)
        
        return result

# Usage: Clean notification mechanism
class NotificationService(VideoAnalysisEvent.Observer):
    def on_analysis_complete(self, video_id: str, result: str):
        # Send notification
        
analysis_service.subscribe(NotificationService())
```

---

## Strategy Pattern

### Purpose
Encapsulate interchangeable algorithms.

```python
# ✅ Strategy for different analysis types
from abc import ABC, abstractmethod

class AnalysisStrategy(ABC):
    @abstractmethod
    async def execute(self, video_path: str) -> str:
        pass

class TranscriptionStrategy(AnalysisStrategy):
    async def execute(self, video_path: str) -> str:
        # Transcription logic
        
class TranslationStrategy(AnalysisStrategy):
    async def execute(self, video_path: str) -> str:
        # Translation logic

class VideoAnalyzer:
    def __init__(self, strategy: AnalysisStrategy):
        self.strategy = strategy
    
    async def analyze(self, video_path: str) -> str:
        return await self.strategy.execute(video_path)

# Switch strategies at runtime
analyzer = VideoAnalyzer(TranscriptionStrategy())
result = await analyzer.analyze("video.mp4")

analyzer.strategy = TranslationStrategy()  # Different strategy
```

---

## Dependency Injection

### Container-Based Injection

```python
# ✅ FastAPI dependency injection
from fastapi import Depends

def get_video_repository() -> VideoRepository:
    """Create repository instance."""
    return SQLVideoRepository(session=get_db())

def get_video_service(
    repo: VideoRepository = Depends(get_video_repository),
) -> VideoAnalysisService:
    """Inject dependencies into service."""
    return VideoAnalysisService(repo)

@router.get("/api/videos/{video_id}")
async def get_video(
    video_id: str,
    service: VideoAnalysisService = Depends(get_video_service),
):
    return await service.get_video(video_id)
```

### Constructor Injection

```typescript
// ✅ TypeScript constructor injection
class VideoService {
  constructor(
    private apiClient: ApiClient,
    private cache: CacheService,
    private logger: Logger,
  ) {}
  
  async getVideo(id: string): Promise<Video> {
    // Use injected dependencies
    const cached = this.cache.get(id);
    if (cached) return cached;
    
    const video = await this.apiClient.get(`/videos/${id}`);
    this.logger.log(`Fetched video ${id}`);
    return video;
  }
}

// Usage: Inject concrete implementations
const service = new VideoService(
  new HttpApiClient(),
  new RedisCache(),
  new ConsoleLogger(),
);
```

---

## Anti-Patterns to Avoid

### God Object
```python
# ❌ Wrong: Everything in one class
class VideoManager:
    def upload(self): ...
    def analyze(self): ...
    def translate(self): ...
    def summarize(self): ...
    def cache(self): ...
    def log(self): ...
    # + 20 more methods

# ✅ Right: Separate concerns
class VideoUploadService: ...
class VideoAnalysisService: ...
class VideoTranslationService: ...
class VideoSummarizationService: ...
```

### Circular Dependencies
```python
# ❌ Wrong: Circular imports
# a.py
from b import B
class A:
    b = B()

# b.py
from a import A
class B:
    a = A()

# ✅ Right: Use interfaces/abstractions
class Service:
    def __init__(self, dependency: AbstractDependency):
        # Use abstraction, not concrete class
```

### Tight Coupling
```typescript
// ❌ Wrong: Coupled to implementation
class VideoPlayer {
  private decoder = new VideoDecoder();  // Hard-coded
}

// ✅ Right: Loosely coupled via injection
interface Decoder {
  decode(data: Uint8Array): Promise<Uint8Array>;
}

class VideoPlayer {
  constructor(private decoder: Decoder) {}  // Abstracts dependency
}
```

---

## Related Standards
- [011_PYTHON_CODING_STANDARDS.md](011_PYTHON_CODING_STANDARDS.md)
- [012_JAVASCRIPT_CODING_STANDARDS.md](012_JAVASCRIPT_CODING_STANDARDS.md)
- [013_CODE_REVIEW_STANDARDS.md](013_CODE_REVIEW_STANDARDS.md)
- [014_TYPE_SAFETY_STANDARDS.md](014_TYPE_SAFETY_STANDARDS.md)
- [017_REFACTORING_STANDARDS.md](017_REFACTORING_STANDARDS.md)

---

**Last Updated:** April 2026
**Status:** Gold Standard
