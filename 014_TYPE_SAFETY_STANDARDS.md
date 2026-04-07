# Type Safety Gold Standards

## Table of Contents
1. [Python Type Safety](#python-type-safety)
2. [TypeScript Type Safety](#typescript-type-safety)
3. [Type Checking Tools](#type-checking-tools)
4. [Common Type Patterns](#common-type-patterns)
5. [Generic Types & Constraints](#generic-types--constraints)
6. [Type Narrowing](#type-narrowing)
7. [Type Inference](#type-inference)
8. [Frontend State Typing](#frontend-state-typing)
9. [API Contract Types](#api-contract-types)
10. [Type-Driven Development](#type-driven-development)

---

## Python Type Safety

### PEP 484 Compliance

All new Python code MUST use type hints. Target: 100% coverage of function signatures.

**Function Signature Types:**
```python
# ✅ Good: Complete type hints
def process_video(
    file_path: str,
    analysis_type: AnalysisType,
    timeout: int = 300
) -> AnalysisResult:
    """Process video file and return analysis."""
    ...

# ❌ Don't: Missing types
def process_video(file_path, analysis_type, timeout=300):
    ...
```

### Variable Annotations

Annotate complex types explicitly:
```python
# ✅ Good: Explicit complex types
from typing import Dict, List, Optional

user_preferences: Dict[str, List[str]] = {}
active_sessions: Optional[Dict[str, Session]] = None

# ✅ Good: Simple types can be inferred
count = 0  # Inferred as int
name = "John"  # Inferred as str

# ❌ Avoid: Type: ignore without justification
json_data: Dict[Any, Any] = {}  # type: ignore
```

### Generic Types

Use TypeVar for polymorphic functions:
```python
from typing import TypeVar, Generic, List

T = TypeVar('T')

def get_first(items: List[T]) -> Optional[T]:
    """Get first item from list while preserving type."""
    return items[0] if items else None

# Correctly typed:
nums: List[int] = get_first([1, 2, 3])  # Type: Optional[int]
names: List[str] = get_first(["a", "b"])  # Type: Optional[str]
```

### Union & Optional Types

Prefer Optional for nullable types:
```python
# ✅ Good: Clear intent
from typing import Optional

def find_user(user_id: int) -> Optional[User]:
    """Returns User or None."""
    ...

# ❌ Avoid: Less clear
from typing import Union

def find_user(user_id: int) -> Union[User, None]:
    ...
```

### Required vs Optional with dataclasses

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class VideoMetadata:
    file_name: str  # Required
    duration: float  # Required
    transcription: Optional[str] = None  # Optional with default
    thumbnail_url: Optional[str] = None
    
    # No positional args after Optional fields
```

---

## TypeScript Type Safety

### Strict Mode Enforcement

`tsconfig.json` MUST include:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### Function Typing

```typescript
// ✅ Good: Full typing
function processVideo(
  file: File,
  options: ProcessingOptions
): Promise<AnalysisResult> {
  return analyzeVideo(file, options);
}

// ✅ Good: Arrow function
const analyzeVideo = async (
  file: File,
  type: AnalysisType
): Promise<AnalysisResult> => {
  // implementation
};

// ❌ Don't: Any types
function processVideo(file: any, options: any): any {
  // ...
}
```

### Interface vs Type

Use **interfaces** for objects/classes, **types** for unions/primitives:

```typescript
// ✅ Interface: Object contracts
interface VideoFile {
  name: string;
  size: number;
  mimeType: string;
}

// ✅ Type: Unions and primitives
type AnalysisType = 'transcription' | 'translation' | 'summarization';
type UserId = string & { readonly __brand: 'UserId' };

// ✅ Extend interfaces
interface ExtendedVideo extends VideoFile {
  uploadedAt: Date;
  userId: string;
}
```

### Generics in TypeScript

```typescript
// ✅ Generic component
interface ApiResponse<T> {
  data: T;
  status: number;
  error?: string;
}

// ✅ Generic API handler
async function fetchData<T>(
  endpoint: string
): Promise<ApiResponse<T>> {
  const response = await fetch(endpoint);
  return response.json();
}

// Usage - type is inferred:
const result = await fetchData<VideoAnalysis>('/api/analysis');
// result.data is AnalysisResult
```

---

## Type Checking Tools

### Python: mypy

**Setup:**
```ini
# setup.cfg or mypy.ini
[mypy]
python_version = 3.11
warn_return_any = True
warn_unused_configs = True
disallow_untyped_defs = True
disallow_incomplete_defs = True
disallow_untyped_calls = True
no_implicit_optional = True
strict_optional = True
warn_redundant_casts = True
warn_unused_ignores = True
```

**Run before commits:**
```bash
# Check all Python files
mypy backend/

# Specific file
mypy backend/main.py
```

### Python: Pyright

Alternative/complementary to mypy (used by Pylance):
```json
{
  "pythonVersion": "3.11",
  "typeCheckingMode": "strict",
  "reportMissingTypeStubs": true,
  "reportIncompatibleVariableOverride": true
}
```

### TypeScript: tsc

Built-in with TypeScript:
```bash
# Type check without emitting
tsc --noEmit

# Check specific file
tsc frontend/src/App.tsx --noEmit
```

### Pre-commit Hooks

Enforce type checking before commit:
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.7.1
    hooks:
      - id: mypy
        additional_dependencies: [types-all]
        
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: check-json
```

---

## Common Type Patterns

### Result Types (Error Handling)

```python
# ✅ Python: Using Union or Optional
from typing import Union

Result[T] = Union[T, Exception]

def dangerous_operation(data: str) -> Result[int]:
    try:
        return int(data)
    except ValueError as e:
        return e
```

```typescript
// ✅ TypeScript: Using discriminated unions
interface Success<T> {
  status: 'success';
  data: T;
}

interface Failure {
  status: 'error';
  error: string;
}

type Result<T> = Success<T> | Failure;

const handleResult = <T,>(result: Result<T>) => {
  if (result.status === 'success') {
    console.log(result.data);  // type: T
  } else {
    console.log(result.error); // type: string
  }
};
```

### Option/Maybe Types

```python
# Python: Optional with helper functions
from typing import Optional, Callable

def map_option[T, R](opt: Optional[T], fn: Callable[[T], R]) -> Optional[R]:
    """Transform optional value if present."""
    return fn(opt) if opt is not None else None

# Usage:
user: Optional[User] = find_user(1)
user_name = map_option(user, lambda u: u.name)
```

### Heterogeneous Tuples

```python
# ✅ Different type per position
from typing import Tuple

def get_user_info(user_id: int) -> Tuple[str, int, bool]:
    """Returns (name, age, is_active)."""
    return ("John", 30, True)

name, age, active = get_user_info(1)
# name: str, age: int, active: bool
```

```typescript
// ✅ TypeScript tuple
type UserInfo = [name: string, age: number, active: boolean];

const getUserInfo = (userId: number): UserInfo => {
  return ["John", 30, true];
};

const [name, age, active] = getUserInfo(1);
// Each has correct type
```

---

## Generic Types & Constraints

### Constrained Generics

```python
# ✅ TypeVar with constraints
from typing import TypeVar

Number = TypeVar('Number', int, float)

def add(a: Number, b: Number) -> Number:
    """Add two numbers."""
    return a + b

add(1, 2)        # ✅ OK
add(1.5, 2.5)    # ✅ OK
add("1", "2")    # ❌ Type error
```

```typescript
// ✅ TypeScript constraint
function add<T extends number | bigint>(a: T, b: T): T {
  return a + b;
}

add(1, 2);        // ✅ OK
add(1n, 2n);      // ✅ OK
add("1", "2");    // ❌ Type error
```

### Bounded Type Parameters

```python
# ✅ Python: Bound types
from typing import TypeVar, Sequence

T = TypeVar('T', bound=Comparable)  # Requires __lt__, etc.

def sort_items(items: list[T]) -> list[T]:
    """Sort items using their comparison operators."""
    return sorted(items)
```

---

## Type Narrowing

### Python: Type Guards

```python
from typing import TypeGuard

def is_video(file: Any) -> TypeGuard[VideoFile]:
    """Safely narrow type to VideoFile."""
    return (
        isinstance(file, dict) and
        'name' in file and
        'mime_type' in file and
        file['mime_type'].startswith('video/')
    )

files: list[Any] = get_files()
for file in files:
    if is_video(file):
        # file is now VideoFile
        process_video(file)
```

### TypeScript: Type Predicates

```typescript
function isVideoFile(file: File): file is VideoFile {
  return file.type.startsWith('video/');
}

const files: File[] = [...];
for (const file of files) {
  if (isVideoFile(file)) {
    // file is VideoFile here
    await uploadVideo(file);
  }
}
```

### Exhaustiveness Checking

```typescript
// ✅ Ensure all union cases handled
type AnalysisType = 'transcription' | 'translation' | 'summarization';

const analyze = (type: AnalysisType): string => {
  switch (type) {
    case 'transcription':
      return 'transcribing...';
    case 'translation':
      return 'translating...';
    case 'summarization':
      return 'summarizing...';
    // ❌ If we forget a case, TS will error:
    // default:
    //   const _exhaustive: never = type;
  }
};
```

---

## Type Inference

### Let the Type Checker Infer When Possible

```python
# ✅ Inference is fine for simple cases
x = 5  # Inferred as int
name = "John"  # Inferred as str
items = [1, 2, 3]  # Inferred as list[int]

# ✅ Explicit types for complex cases
users: Dict[str, User] = {}
results: Optional[List[AnalysisResult]] = None
```

```typescript
// ✅ Inference in TypeScript
const count = 0;  // Inferred as number
const items = [1, 2, 3];  // Inferred as number[]
const result = await fetchData();  // Inferred from function return type

// Be explicit when ambiguous:
const data: Record<string, unknown> = JSON.parse(str);
```

---

## Frontend State Typing

### React Hook Types

```typescript
// ✅ State with explicit types
import { useState } from 'react';

const MyComponent = () => {
  const [count, setCount] = useState<number>(0);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  
  return <div>{count}</div>;
};

// ✅ useCallback with types
const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
  setCount(c => c + 1);
}, []);
```

### Redux/State Management

```typescript
// ✅ Typed Redux actions
interface SetUserAction {
  type: 'SET_USER';
  payload: User;
}

interface ClearUserAction {
  type: 'CLEAR_USER';
}

type UserAction = SetUserAction | ClearUserAction;

const reducer = (state: User | null, action: UserAction): User | null => {
  switch (action.type) {
    case 'SET_USER':
      return action.payload;
    case 'CLEAR_USER':
      return null;
  }
};
```

---

## API Contract Types

### Request/Response Types

```typescript
// ✅ Type your API contracts
interface AnalysisRequest {
  videoId: string;
  analysisType: 'transcription' | 'translation' | 'summarization';
  language?: string;
}

interface AnalysisResponse {
  analysisId: string;
  status: 'processing' | 'complete' | 'failed';
  result?: string;
  error?: {
    code: string;
    message: string;
  };
}

// ✅ Typed API client
const analyzeVideo = async (
  request: AnalysisRequest
): Promise<AnalysisResponse> => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.json();
};
```

### Validation with Types

```python
# ✅ Pydantic for runtime validation
from pydantic import BaseModel, Field, validator

class AnalysisRequest(BaseModel):
    video_id: str
    analysis_type: Literal['transcription', 'translation', 'summarization']
    language: Optional[str] = None
    
    @validator('video_id')
    def validate_video_id(cls, v: str) -> str:
        if not v.startswith('vid_'):
            raise ValueError('Invalid video ID format')
        return v

# Type AND validate at runtime
request = AnalysisRequest(video_id="vid_123", analysis_type='transcription')
```

---

## Type-Driven Development

### Design by Type

Start with types, then implement:

```typescript
// 1. Design the types first
interface VideoProcessor {
  process(file: File): Promise<ProcessResult>;
  cancel(): void;
}

interface ProcessResult {
  success: boolean;
  data?: string;
  error?: ProcessError;
}

// 2. Implement to satisfy types
class VideoProcessorImpl implements VideoProcessor {
  async process(file: File): Promise<ProcessResult> {
    // Implementation follows type contract
  }
  
  cancel(): void {
    // Implementation
  }
}

// 3. Consumers typed safely
const processor: VideoProcessor = new VideoProcessorImpl();
const result = await processor.process(file);
if (result.success) {
  // result.data is guaranteed string here
}
```

### Benefits
- ✅ Catches bugs at compile time
- ✅ Better IDE autocompletion
- ✅ Self-documenting code
- ✅ Easier refactoring
- ✅ Improved maintainability

---

## Related Standards
- [011_PYTHON_CODING_STANDARDS.md](011_PYTHON_CODING_STANDARDS.md)
- [012_JAVASCRIPT_CODING_STANDARDS.md](012_JAVASCRIPT_CODING_STANDARDS.md)
- [013_CODE_REVIEW_STANDARDS.md](013_CODE_REVIEW_STANDARDS.md)
- [016_ARCHITECTURE_DESIGN_PATTERNS_STANDARDS.md](016_ARCHITECTURE_DESIGN_PATTERNS_STANDARDS.md)
- [022_API_CLIENT_STANDARDS.md](022_API_CLIENT_STANDARDS.md)

---

**Last Updated:** April 2026
**Status:** Gold Standard
