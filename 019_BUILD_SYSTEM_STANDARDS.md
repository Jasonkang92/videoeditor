# Build System Gold Standards

## Table of Contents
1. [Build Philosophy](#build-philosophy)
2. [Backend Build Pipeline](#backend-build-pipeline)
3. [Frontend Build Pipeline](#frontend-build-pipeline)
4. [Dependency Management](#dependency-management)
5. [Build Optimization](#build-optimization)
6. [Bundle Analysis](#bundle-analysis)
7. [Build Caching](#build-caching)
8. [Watch Mode & Development](#watch-mode--development)
9. [Docker Build](#docker-build)
10. [Build Monitoring & Metrics](#build-monitoring--metrics)

---

## Build Philosophy

### Core Principles

**Fast:** Developers need feedback quickly (target: <30 seconds for dev builds)

**Reproducible:** Same code produces identical output every time

**Transparent:** Build logs show what's happening, warnings addressed

**Optimized:** Production builds are optimized for performance

---

## Backend Build Pipeline

### Python Backend (FastAPI)

**No compilation step** - Python runs directly. Focus on validation:

```bash
# Development mode: Run directly
cd backend
python -m uvicorn main:app --reload --port 8000

# Validation before "release"
python -m mypy backend/           # Type check
python -m pylint backend/         # Static analysis
pytest backend/ --cov=backend     # Test with coverage
black --check backend/            # Format check
isort --check backend/            # Import check
```

**Pre-commit Hook (automatic)**

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
      - id: black
      - id: isort
      
  - repo: https://github.com/PyCQA/pylint
    rev: v3.0.0
    hooks:
      - id: pylint

# Install on first clone:
# pre-commit install
```

### Environment Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate.ps1  (Windows PowerShell)

# Install dependencies
pip install -r requirements.txt

# Install dev dependencies
pip install -r requirements-dev.txt  # pytest, mypy, black, etc.
```

---

## Frontend Build Pipeline

### Vite Build System

**Development:**
```bash
cd frontend
npm install
npm run dev    # Fast dev server with hot reload
```

**Production:**
```bash
npm run build   # Optimized production build
npm run preview # Test production build locally
```

### build.config.ts

```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize bundle
    minify: 'terser',
    target: 'esnext',
    
    // Source maps for debugging
    sourcemap: true,
    
    // Chunk sizing
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['axios', '@tanstack/react-query'],
        },
      },
    },
    
    // Limits warn if exceeded
    chunkSizeWarningLimit: 500,  // kb
    reportCompressedSize: true,
  },
  
  // Development server
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

### .eslintrc and package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint src/",
    "format": "prettier --write src/",
    "test": "vitest"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

## Dependency Management

### Python Dependencies

```bash
# Keep requirements.txt clean
# backend/requirements.txt (production)
fastapi==0.115.0
uvicorn==0.29.0
sqlalchemy==2.0.0
psycopg2-binary==2.9.9
pydantic==2.5.0
python-dotenv==1.0.0

# backend/requirements-dev.txt (development)
-r requirements.txt
pytest==7.4.0
pytest-cov==4.1.0
mypy==1.7.0
black==23.12.0
isort==5.13.0
pylint==3.0.0
```

**Security:** Regularly audit for vulnerabilities

```bash
# Check for known CVEs
pip install safety
safety check

# Alternative: pip-audit
pip install pip-audit
pip-audit
```

### JavaScript Dependencies

```bash
# Check outdated packages
npm outdated

# Audit security
npm audit

# Fix automatically if safe
npm audit fix

# Update dependencies carefully
npm update package-name

# Remove unused dependencies
npm prune
```

---

## Build Optimization

### Python: Minimize Imports

```python
# ❌ Bad: Import everything at top
from heavy_library import *
from ml_model import large_model

# ✅ Good: Import only when needed
def analyze_video():
    from ml_model import large_model  # Import only on demand
    return large_model.analyze(video)
```

### JavaScript: Code Splitting

```typescript
// ✅ Lazy load heavy components
import { lazy, Suspense } from 'react';

const AnalysisPage = lazy(() => import('./pages/AnalysisPage'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <AnalysisPage />
    </Suspense>
  );
}
```

### Tree Shaking

```typescript
// ✅ Use named imports (tree-shakeable)
import { useQuery, useMutation } from '@tanstack/react-query';

// ❌ Avoid default exports for utilities
// import * as utils from './utils';  // Harder to tree-shake
```

---

## Bundle Analysis

### Frontend Bundle Size Tracking

```bash
# Analyze bundle
npm run build
webpack-bundle-analyzer dist/stats.json

# Or using Vite plugin
npm install -D vite-plugin-visualizer
```

**vite.config.ts:**
```typescript
import { visualizer } from 'vite-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,  // Open in browser automatically
    }),
  ],
});
```

**Target Metrics:**
```
Initial bundle: <250 KB (gzipped)
Core JS: <150 KB
Vendor: <100 KB
CSS: <50 KB
```

### Python: Dependency Audit

```bash
# Show largest packages
pip list --format freeze | sort

# Identify unused dependencies
vulture backend/  # Finds dead code too
```

---

## Build Caching

### Docker Build Cache

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# ✅ Cache layer: dependencies (changes rarely)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ✅ Code layer (changes frequently)
COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

### Frontend Build Cache

```bash
# npm automatically caches node_modules
# Vite caches transformed modules in node_modules/.vite

# Clear if needed
rm -rf node_modules/.vite
npm run build
```

---

## Watch Mode & Development

### Python: Auto-Reload Server

```bash
# Development with auto-reload on file changes
cd backend
uvicorn main:app --reload --port 8000

# Or with hot-reload for faster feedback
pip install uvloop
uvicorn main:app --reload --loop uvloop --port 8000
```

### Frontend: Vite Dev Server

```bash
# Fast dev server with HMR
cd frontend
npm run dev

# Vite rebuilds only changed files
# Updates browser automatically (HMR - Hot Module Replacement)
```

---

## Docker Build

### Multi-Stage Build

```dockerfile
# Dockerfile
# Stage 1: Build backend
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Stage 2: Build frontend
FROM node:18-alpine as frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 3: Final runtime
FROM python:3.11-slim
WORKDIR /app

# Copy cached pip packages from builder
COPY --from=builder /root/.local /root/.local
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Copy built frontend
COPY --from=frontend-builder /app/dist ./frontend/dist

# Copy application code
COPY backend/ .

ENV PATH=/root/.local/bin:$PATH

CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
```

**Build & Test:**
```bash
# Build image
docker build -t llm-video-analytics:latest .

# Test locally
docker run -p 8000:8000 llm-video-analytics:latest

# Check image size
docker images llm-video-analytics
# Target: <400 MB
```

---

## Build Monitoring & Metrics

### Build Success Metrics

```
Target metrics:
- Build time: <30 sec for dev, <2 min for prod
- Success rate: >99%
- Failure detection: On first error
- Cache hit rate: >80% for Docker builds
```

### CI/CD Pipeline Times

```yaml
# GitHub Actions workflow
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install backend dependencies
        run: pip install -r backend/requirements-dev.txt
        
      - name: Type check (backend)
        run: mypy backend/
        
      - name: Lint (backend)
        run: pylint backend/
        
      - name: Test (backend)
        run: pytest backend/ --cov=backend
        
      - name: Install frontend dependencies
        run: npm install
        
      - name: Type check (frontend)
        run: npm run type-check
        
      - name: Lint (frontend)
        run: npm run lint
        
      - name: Test (frontend)
        run: npm test
        
      - name: Build frontend
        run: npm run build

  # Measure overall time
  # GitHub Actions shows duration in UI
```

---

## Related Standards
- [004_DEPLOYMENT_CICD_STANDARDS.md](004_DEPLOYMENT_CICD_STANDARDS.md)
- [008_PERFORMANCE_OPTIMIZATION_STANDARDS.md](008_PERFORMANCE_OPTIMIZATION_STANDARDS.md)
- [011_PYTHON_CODING_STANDARDS.md](011_PYTHON_CODING_STANDARDS.md)
- [012_JAVASCRIPT_CODING_STANDARDS.md](012_JAVASCRIPT_CODING_STANDARDS.md)

---

**Last Updated:** April 2026
**Status:** Gold Standard
