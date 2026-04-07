# Refactoring Gold Standards

## Table of Contents
1. [Refactoring Philosophy](#refactoring-philosophy)
2. [When to Refactor](#when-to-refactor)
3. [Safe Refactoring Practices](#safe-refactoring-practices)
4. [Common Refactoring Techniques](#common-refactoring-techniques)
5. [Extract Method/Function](#extract-methodfunction)
6. [Rename for Clarity](#rename-for-clarity)
7. [Simplify Complex Logic](#simplify-complex-logic)
8. [Remove Duplication](#remove-duplication)
9. [Technical Debt Management](#technical-debt-management)
10. [Refactoring Review Process](#refactoring-review-process)

---

## Refactoring Philosophy

**Definition:** Improving code structure without changing external behavior.

### Key Principles

1. **Change Behavior OR Structure, Not Both**
   - Pure refactoring: No new features, no bug fixes
   - Separate commits: Feature + refactoring are different PRs

```python
# ❌ Wrong: Mix refactoring with bug fix
def calculate_discount(price, category):  # Bad name
    if category == "premium":  # Bug: should check membership
        return price * 0.8  # Fixed bug
    return price  # Also renamed from calc_discount

# ✅ Right: First bug fix, then refactor
# Commit 1: Bug fix
def calc_discount(price, category):
    if category == "premium" and user.is_member:  # Bug fixed
        return price * 0.8
    return price

# Commit 2: Refactoring (rename)
def calculate_discount(price, category):
    if category == "premium" and user.is_member:
        return price * 0.8
    return price
```

2. **Test-Driven Refactoring**
   - Comprehensive tests BEFORE refactoring
   - Run tests after each small change
   - Tests prove behavior unchanged

3. **Incremental Changes**
   - Small, reviewable changes
   - Each change should compile/pass
   - Never refactor multiple things simultaneously

4. **Avoid "Refactoring" Rewrites**
   - Don't rewrite in different style (that's feature development)
   - Don't change algorithm (that's optimization)
   - Preserve original logic

---

## When to Refactor

### Good Reasons to Refactor

✅ **Code Clarity**
- Function too long (>40 lines)
- Nested conditionals (>3 levels)
- Variable names unclear
- Comments explaining WHAT (should be obvious from clear code)

✅ **DRY Violations**
- Same logic copy-pasted 3+ times
- Merge conflicts from duplicate code
- Related changes require updating multiple places

✅ **Technical Debt**
- Documented in issue tracker
- Blocking new development
- Performance bottleneck identified
- Security issue that requires refactoring

✅ **Architectural Improvement**
- Breaking Liskov Substitution Principle
- Tight coupling preventing testing
- Circular dependencies

### Bad Reasons to Refactor

❌ **Personal Style Preference**
- "I prefer snake_case to camelCase" (follow project standards instead)

❌ **Pattern Obsession**
- "This should use factory pattern" (YAGNI)

❌ **Preparatory Refactoring**
- Refactoring for features you *might* add later
- Wait until you actually need it

❌ **During Crunch Time**
- Too risky to introduce subtle bugs
- Save refactoring for planning phase

---

## Safe Refactoring Practices

### The Refactoring Workflow

1. **Get Tests Green First**
   ```bash
   # Ensure ALL tests pass before starting
   pytest --cov=backend backend/
   npm run test:frontend
   ```

2. **Create Refactoring Branch**
   ```bash
   git checkout -b refactor/clear-video-analysis-logic
   ```

3. **Make Single Change**
   ```bash
   # Change ONE thing: extract function, rename variable, etc.
   # Run tests immediately
   ```

4. **Verify Tests Still Pass**
   ```bash
   # MUST pass - proves behavior unchanged
   pytest backend/
   ```

5. **Commit With Clear Message**
   ```bash
   git commit -m "refactor: extract video analysis logic to separate function
   
   No behavior change. Extacts analysis_video_file() to improve clarity.
   Tests confirm behavior unchanged."
   ```

6. **Repeat Small Changes**
   - Make next incremental change
   - Test + commit again

7. **PR with Refactoring Label**
   - PR description: "Refactoring: ..."
   - Reviewers can focus on code clarity, not behavior

### IDE Refactoring Tools

Use your IDE's built-in refactoring tools - they're safer than manual edits:

```python
# Python: Use IDE's rename functionality
# Before
def calc_daily_revenue(transactions):
    return sum(t.amount for t in transactions)

# After (IDE renames consistently)
def calculate_daily_revenue(transactions):
    return sum(t.amount for t in transactions)
```

```typescript
// TypeScript: Use VS Code's refactoring
// Rename symbol: F2 or right-click → Rename Symbol
// Extract function: Select code → right-click → Extract Function
```

---

## Common Refactoring Techniques

### Rename Variable/Function

**Most important refactoring:** Names are 80% of code clarity.

```python
# ❌ Unclear names
def proc(d, t):
    return d * (1 + (t / 100))

# ✅ Clear names
def calculate_compound_interest(principal: float, rate: float) -> float:
    return principal * (1 + (rate / 100))
```

### Extract Method/Function

**Too long function → smaller, focused functions**

```python
# ❌ Long, doing multiple things (>40 lines)
def analyze_video(video_path: str) -> dict:
    # Load video
    video = load_video(video_path)
    
    # Extract audio
    audio = video.extract_audio()
    
    # Transcribe
    transcription = transcribe_audio(audio)
    
    # Translate
    translation = translate_text(transcription)
    
    # Summarize
    summary = summarize_text(transcription)
    
    # Save results
    save_results({...})
    
    # Log metrics
    log_analysis_metrics({...})

# ✅ Extracted into smaller functions
def analyze_video(video_path: str) -> VideoAnalysis:
    video = load_video(video_path)
    
    analysis = VideoAnalysis(
        transcription=_extract_transcription(video),
        translation=_extract_translation(video),
        summary=_extract_summary(video),
    )
    
    _persist_analysis(analysis)
    _log_metrics(analysis)
    
    return analysis

def _extract_transcription(video: Video) -> str:
    audio = video.extract_audio()
    return transcribe_audio(audio)

def _extract_translation(video: Video) -> str:
    transcription = _extract_transcription(video)
    return translate_text(transcription)
```

### Simplify Conditionals

```python
# ❌ Complex nested conditionals
def should_process_video(video):
    if video is not None:
        if video.size > 0:
            if video.format in ['mp4', 'avi', 'mov']:
                if video.user.is_active:
                    if video.user.subscription.is_valid():
                        return True
    return False

# ✅ Guard clauses (early return)
def should_process_video(video: Video) -> bool:
    if video is None:
        return False
    if video.size == 0:
        return False
    if video.format not in ['mp4', 'avi', 'mov']:
        return False
    if not video.user.is_active:
        return False
    if not video.user.subscription.is_valid():
        return False
    return True

# ✅ Even better: Extract validation
def should_process_video(video: Video) -> bool:
    return (
        _is_valid_video(video) and
        _is_active_user(video.user) and
        _has_valid_subscription(video.user)
    )
```

---

## Extract Method/Function

### Python Example

```python
# ❌ Long analysis function
async def analyze_video(video_id: str) -> AnalysisResult:
    # Validate input
    if not video_id:
        raise ValueError("Video ID required")
    if not re.match(r'^vid_\w+$', video_id):
        raise ValueError("Invalid video ID format")
    
    # Fetch video
    video = await db.videos.get(video_id)
    if not video:
        raise VideoNotFoundError(video_id)
    
    # Check permissions
    if video.user_id != current_user.id:
        raise PermissionError("Cannot analyze other users' videos")
    
    # Process transcription...
    # (20 more lines)

# ✅ Extracted functions
async def analyze_video(video_id: str) -> AnalysisResult:
    _validate_video_id(video_id)
    video = await _fetch_and_verify_video(video_id)
    return await _perform_analysis(video)

def _validate_video_id(video_id: str) -> None:
    """Validate video ID format."""
    if not video_id:
        raise ValueError("Video ID required")
    if not re.match(r'^vid_\w+$', video_id):
        raise ValueError("Invalid video ID format")

async def _fetch_and_verify_video(video_id: str) -> Video:
    """Fetch video and verify ownership."""
    video = await db.videos.get(video_id)
    if not video:
        raise VideoNotFoundError(video_id)
    if video.user_id != current_user.id:
        raise PermissionError("Cannot analyze other users' videos")
    return video

async def _perform_analysis(video: Video) -> AnalysisResult:
    """Execute analysis pipeline."""
    # Implementation
```

---

## Rename for Clarity

### Naming Guidelines

```python
# ❌ Unclear: Abbreviations, meaningless letters
def proc_vids(vids, t):
    return [v for v in vids if v.size < t]

# ✅ Clear: Explicit, searchable names
def filter_videos_by_max_size(videos: List[Video], max_size_mb: int) -> List[Video]:
    return [video for video in videos if video.size_mb < max_size_mb]
```

**Refactoring pattern:**
```bash
# 1. Ensure tests passing
pytest backend/

# 2. Use IDE "Rename Symbol" (F2)
# 3. Update all occurrences automatically
# 4. Tests pass again
pytest backend/

# 5. Commit
git commit -m "refactor: improve variable naming for clarity"
```

---

## Simplify Complex Logic

### Replace Conditional with Polymorphism

```python
# ❌ Long if/else chain
def analyze(analysis_type: str, video_path: str) -> str:
    if analysis_type == 'transcription':
        return transcribe_video(video_path)
    elif analysis_type == 'translation':
        return translate_transcription(video_path)
    elif analysis_type == 'summarization':
        return summarize_transcription(video_path)
    else:
        raise ValueError(f"Unknown type: {analysis_type}")

# ✅ Strategy pattern eliminates conditional
analyzer = AnalyzerFactory.create(analysis_type)
return await analyzer.analyze(video_path)
```

### Decompose Complex Expressions

```python
# ❌ Hard to understand
revenue = sum(
    order.items.reduce(
        lambda sum, item: sum + (item.price * (1 - item.discount / 100)),
        0
    )
    for order in orders
    if order.user.subscription.is_valid() and order.status == 'completed'
)

# ✅ Extract helper functions
def calculate_item_total(item: OrderItem) -> float:
    """Calculate item cost after discount."""
    return item.price * (1 - item.discount / 100)

def is_valid_order(order: Order) -> bool:
    """Order counts toward revenue calculation."""
    return (
        order.user.subscription.is_valid() and
        order.status == 'completed'
    )

revenue = sum(
    sum(calculate_item_total(item) for item in order.items)
    for order in orders
    if is_valid_order(order)
)
```

---

## Remove Duplication

### DRY Violation: Copy-Paste Code

```python
# ❌ Duplicated logic in 3 places
class VideoProcessor:
    def process_transcription(self, video_id: str) -> str:
        # Validation code
        if not self.validate_video_exists(video_id):
            raise VideoNotFoundError()
        
        # Fetch video
        video = self.db.get_video(video_id)
        
        # Check auth
        if video.user_id != self.current_user_id:
            raise PermissionError()
        
        # Process
        return transcribe(video.path)
    
    def process_translation(self, video_id: str) -> str:
        # Validation code (DUPLICATE)
        if not self.validate_video_exists(video_id):
            raise VideoNotFoundError()
        
        # Fetch video (DUPLICATE)
        video = self.db.get_video(video_id)
        
        # Check auth (DUPLICATE)
        if video.user_id != self.current_user_id:
            raise PermissionError()
        
        # Process
        return translate(video.path)

# ✅ Extract common logic
class VideoProcessor:
    async def _get_validated_video(self, video_id: str) -> Video:
        """Get video with validation and auth checks."""
        if not self.validate_video_exists(video_id):
            raise VideoNotFoundError()
        
        video = self.db.get_video(video_id)
        
        if video.user_id != self.current_user_id:
            raise PermissionError()
        
        return video
    
    async def process_transcription(self, video_id: str) -> str:
        video = await self._get_validated_video(video_id)
        return await transcribe(video.path)
    
    async def process_translation(self, video_id: str) -> str:
        video = await self._get_validated_video(video_id)
        return await translate(video.path)
```

---

## Technical Debt Management

### Documenting Technical Debt

```python
# ✅ Mark with TODO/FIXME with owner and deadline
# TODO(reine): Optimize video loading - refactor to batch API calls by EOM Q2
def load_videos(video_ids: List[str]) -> List[Video]:
    return [db.get_video(vid) for vid in video_ids]  # N+1 query

# ✅ Create issue for non-trivial debt
# Issue: https://github.com/org/repo/issues/234
# Title: "Video API: Refactor N+1 query in load_videos()"
# Labels: technical-debt, performance
# Priority: High
# Deadline: 2026-06-30
```

### Debt-to-Feature Ratio

```
Healthy ratio: 20% refactoring / optimization, 80% new features
Unhealthy ratio: >50% of sprint fixing old issues

If debt ratio > 30%:
1. Allocate sprint without new features (cleanup sprint)
2. Pay down oldest/highest-impact debt first
3. Prevent new debt by code review (see 013_CODE_REVIEW_STANDARDS.md)
```

---

## Refactoring Review Process

### What Reviewers Check

✅ **Behavior Unchanged**
- Tests pass with same results
- No hidden behavior changes
- Edge cases still handled

✅ **Improvements Are Real**
- Code is actually clearer
- Less duplication
- Better naming

✅ **No Scope Creep**
- Only refactoring, no features
- No unrelated changes

✅ **Safe Refactoring**
- Tests existed beforehand
- Changes incremental
- No risky rewrites

### Code Review Checklist for Refactoring

```
[ ] Tests pass (same results as before)
[ ] No behavior changes, only structure
[ ] Code is clearer/more maintainable
[ ] No unrelated changes mixed in
[ ] Comments updated if needed
[ ] No new dependencies introduced
[ ] Performance not negatively impacted
```

---

## Related Standards
- [013_CODE_REVIEW_STANDARDS.md](013_CODE_REVIEW_STANDARDS.md)
- [016_ARCHITECTURE_DESIGN_PATTERNS_STANDARDS.md](016_ARCHITECTURE_DESIGN_PATTERNS_STANDARDS.md)
- [011_PYTHON_CODING_STANDARDS.md](011_PYTHON_CODING_STANDARDS.md)
- [012_JAVASCRIPT_CODING_STANDARDS.md](012_JAVASCRIPT_CODING_STANDARDS.md)
- [003_TESTING_STANDARDS.md](003_TESTING_STANDARDS.md)

---

**Last Updated:** April 2026
**Status:** Gold Standard
