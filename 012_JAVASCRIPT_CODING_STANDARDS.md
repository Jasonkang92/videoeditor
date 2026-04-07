# JavaScript Coding Gold Standards

## Table of Contents
1. [Code Style & Formatting](#code-style--formatting)
2. [Naming Conventions](#naming-conventions)
3. [Documentation & Comments](#documentation--comments)
4. [Project Structure](#project-structure)
5. [Error Handling](#error-handling)
6. [Security Best Practices](#security-best-practices)
7. [Testing](#testing)
8. [Performance Optimization](#performance-optimization)
9. [React Best Practices](#react-best-practices)
10. [Async & Promises](#async--promises)
11. [Dependency Management](#dependency-management)
12. [Git & Version Control](#git--version-control)

---

## Code Style & Formatting

### ESLint Configuration
Create `.eslintrc.json` in root:
```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "prettier"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "double"],
    "semi": ["error", "always"],
    "no-console": ["warn"],
    "no-unused-vars": ["warn"],
    "no-var": "error",
    "prefer-const": "error"
  }
}
```

### Prettier Configuration
Create `.prettierrc.json`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 88,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```

### Formatting Rules

#### Line Length & Breaking
```javascript
// ❌ Bad: Line too long
const processVideoMetadata = (videoFile, analysisType, languageCode, includeTimestamps, enableTranslation) => {
  return videoFile;
};

// ✅ Good: Proper breaking at 88 characters
const processVideoMetadata = (
  videoFile,
  analysisType,
  languageCode,
  includeTimestamps,
  enableTranslation
) => {
  return videoFile;
};
```

#### Indentation
```javascript
// ✅ Use 2 spaces (consistent with frontend standards)
function analyzeVideo(videoData) {
  if (videoData.valid) {
    const metadata = {
      id: videoData.id,
      duration: videoData.duration,
    };
    return metadata;
  }
  return null;
}
```

#### Semicolons & Quotes
```javascript
// ✅ Always use semicolons
const API_URL = "https://api.example.com";
const message = "Video uploaded successfully";

// ✅ Use double quotes for strings
const userName = "John Doe";
const errorMsg = 'Use double quotes instead';  // ❌ Avoid single quotes

// ✅ Use backticks for template literals
const videoId = "abc123";
const url = `${API_URL}/videos/${videoId}`;
```

---

## Naming Conventions

### Variables & Constants
```javascript
// ❌ Bad: Unclear naming
const v = "video";
const d = 1024;
let fn = () => {};
const MAXSIZE = 1024;

// ✅ Good: Clear, descriptive names
const videoFile = "video.mp4";
const maxFileSize = 1024;
let handleVideoUpload = () => {};
const MAX_VIDEO_DURATION_SECONDS = 3600;
```

### Functions & Methods
```javascript
// ✅ Use camelCase for functions
function extractAudioFromVideo(videoPath) {
  return audioData;
}

const uploadVideoFile = async (file) => {
  return await apiClient.post("/upload", file);
};

const isValidFormat = (fileExtension) => {
  return SUPPORTED_FORMATS.includes(fileExtension);
};

// ✅ Prefix boolean utilities with is/has/can/should
const isLoading = true;
const hasPermission = false;
const canDelete = true;
const shouldRetry = true;
```

### Classes & Constructors
```javascript
// ✅ Use PascalCase for classes
class VideoAnalyzer {
  constructor(videoPath) {
    this.videoPath = videoPath;
  }

  analyzeContent() {
    return this.processVideo();
  }
}

// ✅ Use PascalCase for custom errors
class VideoProcessingError extends Error {
  constructor(message) {
    super(message);
    this.name = "VideoProcessingError";
  }
}
```

### Constants
```javascript
// ✅ Use UPPER_SNAKE_CASE for constants
const DEFAULT_LANGUAGE = "en";
const MAX_VIDEO_DURATION = 3600;
const SUPPORTED_VIDEO_FORMATS = ["mp4", "webm", "avi"];
const API_TIMEOUT_MS = 30000;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
```

### Private Members
```javascript
// ✅ Use underscore prefix for private methods/properties
class VideoProcessor {
  constructor() {
    this._privateData = null;
  }

  _internalHelper() {
    // Private method
  }

  publicMethod() {
    return this._internalHelper();
  }
}

// ✅ Or use # for true private fields (ES2022)
class ModernVideoProcessor {
  #privateData;

  #internalHelper() {
    // Truly private
  }

  publicMethod() {
    return this.#internalHelper();
  }
}
```

---

## Documentation & Comments

### JSDoc Comments
```javascript
/**
 * Transcribe audio content to text.
 *
 * Supports multiple audio formats (WAV, MP3, OGG, FLAC) and
 * languages via Google Cloud Speech-to-Text service.
 *
 * @param {Uint8Array} audioBuffer - Raw audio bytes to transcribe.
 * @param {string} [languageCode="en-US"] - BCP-47 language code.
 * @param {boolean} [enableTimestamps=false] - Return word-level timestamps.
 * @returns {Promise<Object>} Object containing transcript, confidence, timestamps.
 * @throws {Error} If audioBuffer is empty or service fails.
 *
 * @example
 * const audio = fs.readFileSync("sample.wav");
 * const result = await transcribeAudio(audio, "en-US");
 * console.log(result.transcript);
 */
async function transcribeAudio(
  audioBuffer,
  languageCode = "en-US",
  enableTimestamps = false
) {
  // Implementation
}

/**
 * VideoAnalyzer class for processing video content.
 *
 * @class VideoAnalyzer
 * @param {string} videoPath - Path to video file.
 * @param {Object} [options] - Configuration options.
 * @param {number} [options.maxDuration=3600] - Max duration in seconds.
 */
class VideoAnalyzer {
  constructor(videoPath, options = {}) {
    this.videoPath = videoPath;
    this.maxDuration = options.maxDuration || 3600;
  }

  /**
   * Extract audio stream from video.
   * @returns {Promise<Buffer>} Audio data buffer.
   */
  async extractAudio() {
    // Implementation
  }
}
```

### Code Comments
```javascript
// ✅ Comments explain WHY, not WHAT
function calculateConfidenceScore(predictions) {
  // Exclude first prediction as it's typically biased by model initialization
  const filtered = predictions.slice(1);

  // Return mean only if we have valid predictions to avoid division by zero
  return filtered.length > 0 ? filtered.reduce((a, b) => a + b) / filtered.length : 0;
}

// ❌ Avoid obvious comments
const count = 0;  // Set count to zero
const total = a + b;  // Add a to b
```

### TODO & FIXME Comments
```javascript
// TODO: Implement retry logic with exponential backoff
async function uploadVideo(file) {
  // Implementation
}

// FIXME: Race condition when multiple uploads happen simultaneously
function updateProgressBar(percentage) {
  // Implementation
}

// NOTE: Google Cloud quota resets at midnight UTC
const API_RESET_TIME = "00:00:00";
```

---

## Project Structure

### Frontend (React) Organization
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── index.jsx           # Entry point
│   ├── App.jsx             # Root component
│   ├── config.js           # Configuration
│   ├── components/         # Reusable components
│   │   ├── common/         # Shared UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Spinner.jsx
│   │   ├── AnalysisResult.jsx
│   │   ├── FilePreview.jsx
│   │   └── LoginForm.jsx
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx
│   │   ├── AnalysisPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAnalysisAPI.js
│   │   ├── useAuth.js
│   │   └── useLocalStorage.js
│   ├── services/           # API services
│   │   ├── apiClient.js
│   │   ├── videoService.js
│   │   └── authService.js
│   ├── utils/              # Utility functions
│   │   ├── fileUtils.js
│   │   ├── validators.js
│   │   └── formatters.js
│   ├── styles/             # CSS/styling
│   │   ├── index.css
│   │   ├── variables.css
│   │   └── components/
│   └── __tests__/          # Test files
│       ├── components/
│       ├── hooks/
│       └── utils/
├── package.json
├── vite.config.js
└── .eslintrc.json
```

### Component File Organization
```javascript
// ✅ Standard component structure
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./FilePreview.css";

/**
 * FilePreview component for displaying uploaded files.
 * @component
 */
function FilePreview({ file, onRemove }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    // Load preview
    loadPreview(file);
  }, [file]);

  const handleRemove = () => {
    onRemove(file.id);
  };

  return (
    <div className="file-preview">
      {preview && <img src={preview} alt={file.name} />}
      <button onClick={handleRemove}>Remove</button>
    </div>
  );
}

FilePreview.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.string.required,
    name: PropTypes.string.required,
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default FilePreview;
```

---

## Error Handling

### Custom Error Classes
```javascript
// ✅ Create specific, descriptive error classes
class VideoProcessingError extends Error {
  constructor(message, code = "PROCESSING_ERROR") {
    super(message);
    this.name = "VideoProcessingError";
    this.code = code;
  }
}

class TranscriptionError extends Error {
  constructor(message, retryable = false) {
    super(message);
    this.name = "TranscriptionError";
    this.retryable = retryable;
  }
}

class AuthenticationError extends Error {
  constructor(message = "Authentication failed") {
    super(message);
    this.name = "AuthenticationError";
  }
}
```

### Try-Catch & Error Handling
```javascript
// ✅ Proper error handling with context
async function uploadAndProcessVideo(file) {
  try {
    if (!file) {
      throw new Error("File is required");
    }

    const uploadResponse = await uploadFile(file);
    const analysis = await analyzeVideo(uploadResponse.videoId);

    return analysis;
  } catch (error) {
    if (error instanceof TranscriptionError && error.retryable) {
      console.warn("Transcription failed, retrying...", error);
      return await uploadAndProcessVideo(file);
    }

    console.error("Failed to process video:", {
      message: error.message,
      code: error.code,
      file: file?.name,
    });

    throw new VideoProcessingError(
      `Failed to process video: ${error.message}`,
      "PROCESSING_ERROR"
    );
  }
}
```

### Async Error Handling
```javascript
// ✅ Use try-await with async/await
async function fetchUserData(userId) {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error("User not found");
    }
    throw error;
  }
}

// ✅ Handle promise rejections
Promise.all([fetchVideos(), fetchUsers()])
  .then(([videos, users]) => {
    console.log("Data loaded", videos, users);
  })
  .catch((error) => {
    console.error("Failed to load data:", error);
  });
```

---

## Security Best Practices

### Input Validation & Sanitization
```javascript
// ✅ Validate all user inputs
function validateVideoUpload(file) {
  if (!file) {
    throw new Error("File is required");
  }

  const maxSize = 500 * 1024 * 1024; // 500MB
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum of ${maxSize} bytes`);
  }

  const allowedFormats = ["video/mp4", "video/webm", "video/avi"];
  if (!allowedFormats.includes(file.type)) {
    throw new Error("Unsupported file format");
  }

  return true;
}

// ✅ Sanitize user input to prevent XSS
import DOMPurify from "dompurify";

function displayUserContent(content) {
  const sanitized = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

### Authentication & Authorization
```javascript
// ✅ Implement proper auth checks
const apiClient = axios.create({
  baseURL: process.env.VITE_API_URL,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### Secrets Management
```javascript
// ✅ Use environment variables for secrets
// .env.local (never commit this)
VITE_API_URL=https://api.example.com
VITE_API_KEY=sk_test_abc123xyz

// config.js
const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  apiKey: import.meta.env.VITE_API_KEY,
};

// ❌ Never hardcode secrets
// const API_KEY = "sk_live_secret_12345";  // NEVER DO THIS

// ✅ Use .gitignore
// .gitignore
.env.local
.env.*.local
secrets/
```

### CORS & CSP Headers
```javascript
// ✅ Configure CORS properly (backend)
const cors = require("cors");

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

---

## Testing

### Unit Tests with Vitest/Jest
```javascript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { calculateConfidenceScore, validateVideoFile } from "./utils";

describe("calculateConfidenceScore", () => {
  it("should calculate mean of predictions", () => {
    const predictions = [0.8, 0.85, 0.9];
    const result = calculateConfidenceScore(predictions);
    expect(result).toBe(0.85);
  });

  it("should return 0 for empty predictions", () => {
    expect(calculateConfidenceScore([])).toBe(0);
  });

  it("should exclude first prediction", () => {
    const predictions = [0.5, 0.8, 0.9];
    const result = calculateConfidenceScore(predictions);
    expect(result).toBe(0.85); // (0.8 + 0.9) / 2
  });
});

describe("validateVideoFile", () => {
  it("should accept valid video formats", () => {
    const file = { type: "video/mp4", size: 100 * 1024 * 1024 };
    expect(() => validateVideoFile(file)).not.toThrow();
  });

  it("should reject oversized files", () => {
    const file = { type: "video/mp4", size: 600 * 1024 * 1024 };
    expect(() => validateVideoFile(file)).toThrow("exceeds maximum");
  });
});
```

### React Component Testing
```javascript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VideoUploader } from "./VideoUploader";

describe("VideoUploader Component", () => {
  const mockOnUpload = vi.fn();

  beforeEach(() => {
    mockOnUpload.mockClear();
  });

  it("should render upload button", () => {
    render(<VideoUploader onUpload={mockOnUpload} />);
    expect(screen.getByRole("button", { name: /upload/i })).toBeInTheDocument();
  });

  it("should call onUpload when file is selected", async () => {
    const user = userEvent.setup();
    render(<VideoUploader onUpload={mockOnUpload} />);

    const file = new File(["video data"], "test.mp4", { type: "video/mp4" });
    const input = screen.getByRole("button", { name: /upload/i });

    await user.upload(input, file);

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith(expect.objectContaining({ name: "test.mp4" }));
    });
  });

  it("should display error for invalid files", async () => {
    const user = userEvent.setup();
    render(<VideoUploader onUpload={mockOnUpload} />);

    const file = new File(["text"], "test.txt", { type: "text/plain" });
    const input = screen.getByRole("button", { name: /upload/i });

    await user.upload(input, file);

    expect(screen.getByText(/unsupported/i)).toBeInTheDocument();
  });
});
```

### Integration Tests
```javascript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import axios from "axios";

describe("Video API Integration", () => {
  let testVideoId;

  beforeAll(async () => {
    // Setup test data
    const response = await axios.post("/api/videos", {
      title: "Test Video",
      description: "Test",
    });
    testVideoId = response.data.id;
  });

  afterAll(async () => {
    // Cleanup
    await axios.delete(`/api/videos/${testVideoId}`);
  });

  it("should upload and retrieve video metadata", async () => {
    const metadata = await axios.get(`/api/videos/${testVideoId}`);
    expect(metadata.data.title).toBe("Test Video");
  });

  it("should handle concurrent requests", async () => {
    const requests = Array(5)
      .fill(null)
      .map(() => axios.get(`/api/videos/${testVideoId}`));

    const results = await Promise.all(requests);
    expect(results).toHaveLength(5);
    expect(results.every((r) => r.status === 200)).toBe(true);
  });
});
```

---

## Performance Optimization

### Memoization & Optimization
```javascript
// ✅ Use useMemo for expensive computations
import { useMemo } from "react";

function AnalysisResult({ data, confidenceThreshold }) {
  const filteredResults = useMemo(() => {
    return data.results.filter((r) => r.confidence > confidenceThreshold);
  }, [data.results, confidenceThreshold]);

  return <div>{filteredResults.map((r) => <p key={r.id}>{r.text}</p>)}</div>;
}

// ✅ Use useCallback to memoize functions
import { useCallback } from "react";

function VideoList({ videos, onSelect }) {
  const handleSelect = useCallback(
    (videoId) => {
      onSelect(videoId);
    },
    [onSelect]
  );

  return videos.map((v) => (
    <button key={v.id} onClick={() => handleSelect(v.id)}>
      {v.title}
    </button>
  ));
}

// ✅ Use React.memo for preventing unnecessary re-renders
const VideoCard = React.memo(({ video, onPlay }) => {
  return (
    <div>
      <h3>{video.title}</h3>
      <button onClick={() => onPlay(video.id)}>Play</button>
    </div>
  );
});
```

### Lazy Loading & Code Splitting
```javascript
// ✅ Lazy load components with React.lazy
import { lazy, Suspense } from "react";

const AnalysisPage = lazy(() => import("./pages/AnalysisPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

function App() {
  return (
    <Routes>
      <Route
        path="/analysis"
        element={
          <Suspense fallback={<Spinner />}>
            <AnalysisPage />
          </Suspense>
        }
      />
      <Route
        path="/settings"
        element={
          <Suspense fallback={<Spinner />}>
            <SettingsPage />
          </Suspense>
        }
      />
    </Routes>
  );
}
```

### Debouncing & Throttling
```javascript
// ✅ Implement debouncing for search
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchVideos() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchAPI(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search videos..."
    />
  );
}
```

### Bundle Size Optimization
```javascript
// ✅ Analyze bundle size
// package.json
{
  "scripts": {
    "analyze": "vite-plugin-visualizer"
  }
}

// ✅ Lazy load heavy libraries
const Plotly = lazy(() => import("react-plotly.js"));

// ✅ Use dynamic imports
async function loadChartLibrary() {
  return await import("chart.js");
}
```

---

## React Best Practices

### Hooks Usage
```javascript
// ✅ Follow hooks rules
// Only call hooks at top level
// Only call hooks from React function components

function VideoPlayer({ videoId }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  // ✅ Fetch data in useEffect
  useEffect(() => {
    const fetchDuration = async () => {
      const data = await videoService.getDuration(videoId);
      setDuration(data);
    };

    fetchDuration();
  }, [videoId]); // Dependency array

  // ✅ Cleanup resources
  useEffect(() => {
    const timer = setInterval(() => {
      console.log("Checking playback status");
    }, 1000);

    return () => clearInterval(timer); // Cleanup
  }, []);

  return (
    <div>
      <video>
        <source src={`/videos/${videoId}`} />
      </video>
    </div>
  );
}
```

### Component Composition
```javascript
// ✅ Use composition over inheritance
function AnalysisContainer({ videoId }) {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalysis(videoId);
  }, [videoId]);

  if (isLoading) return <Spinner />;
  if (!analysis) return <ErrorMessage />;

  return (
    <div>
      <AnalysisHeader analysis={analysis} />
      <AnalysisBody analysis={analysis} />
      <AnalysisFooter analysis={analysis} />
    </div>
  );
}

function AnalysisHeader({ analysis }) {
  return <h1>{analysis.title}</h1>;
}

function AnalysisBody({ analysis }) {
  return <div>{analysis.content}</div>;
}
```

### Props & TypeScript
```javascript
// ✅ Use PropTypes for runtime validation
import PropTypes from "prop-types";

function VideoCard({ video, onPlay, onDelete }) {
  return (
    <div>
      <h3>{video.title}</h3>
      <button onClick={() => onPlay(video.id)}>Play</button>
      <button onClick={() => onDelete(video.id)}>Delete</button>
    </div>
  );
}

VideoCard.propTypes = {
  video: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    duration: PropTypes.number,
  }).isRequired,
  onPlay: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

// ✅ Or use TypeScript
interface Video {
  id: string;
  title: string;
  duration?: number;
}

interface VideoCardProps {
  video: Video;
  onPlay: (videoId: string) => void;
  onDelete: (videoId: string) => void;
}

function VideoCard({ video, onPlay, onDelete }: VideoCardProps) {
  return (
    <div>
      <h3>{video.title}</h3>
      <button onClick={() => onPlay(video.id)}>Play</button>
      <button onClick={() => onDelete(video.id)}>Delete</button>
    </div>
  );
}
```

---

## Async & Promises

### Async/Await Pattern
```javascript
// ✅ Use async/await for readability
async function processVideoWithRetry(videoId, maxRetries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const video = await fetchVideo(videoId);
      const analysis = await analyzeVideo(video);
      return analysis;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed, retrying...`);

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

### Promise Handling
```javascript
// ✅ Chain promises with proper error handling
function loadVideoData(videoId) {
  return fetchVideo(videoId)
    .then((video) => validateVideo(video))
    .then((validVideo) => enrichVideoData(validVideo))
    .catch((error) => {
      console.error("Failed to load video:", error);
      return null;
    });
}

// ✅ Use Promise.all for parallel operations
async function loadAnalysisData(videoId) {
  try {
    const [metadata, transcription, sentiment] = await Promise.all([
      fetchMetadata(videoId),
      fetchTranscription(videoId),
      fetchSentiment(videoId),
    ]);

    return { metadata, transcription, sentiment };
  } catch (error) {
    console.error("Failed to load analysis data:", error);
    throw error;
  }
}

// ✅ Use Promise.allSettled for partial failures
async function syncAllVideos(videoIds) {
  const results = await Promise.allSettled(
    videoIds.map((id) => syncVideo(id))
  );

  const successful = results.filter((r) => r.status === "fulfilled");
  const failed = results.filter((r) => r.status === "rejected");

  return { successful, failed };
}
```

---

## Dependency Management

### package.json Organization
```json
{
  "name": "video-analytics",
  "version": "1.0.0",
  "description": "Video analytics platform",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src/",
    "format": "prettier --write src/",
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "dompurify": "^3.0.6"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.1.0",
    "@testing-library/user-event": "^14.5.1"
  }
}
```

### Version Management
```bash
# Install dependencies
npm install

# Update specific package
npm update package-name

# Check for outdated packages
npm outdated

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Lock File Management
```bash
# Use package-lock.json (npm) or yarn.lock (yarn)
# Always commit lock files to ensure consistency
# Clean install in CI/CD
npm ci
```

---

## Git & Version Control

### Conventional Commits
```bash
# ✅ Use conventional commit format
git commit -m "feat: add video upload progress indicator"
git commit -m "fix: resolve memory leak in useEffect cleanup"
git commit -m "docs: update API documentation"
git commit -m "test: add unit tests for file validation"
git commit -m "refactor: extract video player logic into custom hook"
git commit -m "style: format code with prettier"
git commit -m "perf: optimize bundle size with code splitting"

# Format: <type>(<scope>): <subject>
# Types: feat, fix, docs, test, refactor, style, perf, chore
```

### .gitignore
```
# Dependencies
node_modules/
npm-debug.log
yarn-error.log
package-lock.json
yarn.lock

# Build outputs
dist/
build/
.next/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*.vs

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Logs
*.log
logs/

# Temp files
temp/
tmp/
*.tmp
```

### Branch Naming
```bash
# ✅ Use descriptive branch names
git checkout -b feature/video-upload
git checkout -b fix/auth-token-expiry
git checkout -b docs/update-readme
git checkout -b refactor/component-hooks

# Format: <type>/<description>
```

---

## Summary of Key Principles

1. **Consistency**: Follow agreed standards across the entire project
2. **Readability**: Code should be easy to understand at first glance
3. **Documentation**: Document WHY, not WHAT
4. **Testing**: Write tests alongside code, aim for >80% coverage
5. **Security**: Validate inputs, sanitize outputs, manage secrets securely
6. **Performance**: Optimize for user experience; measure before optimizing
7. **Maintainability**: Write code for future developers and your future self
8. **Responsibility**: Own your code quality and security implications

---

## Tools & Commands Reference

```bash
# Code Formatting
npm run format       # Format with Prettier
npm run lint         # Lint with ESLint

# Testing
npm test             # Run tests with Vitest
npm run test:ui      # Run tests with UI

# Building
npm run build        # Production build
npm run preview      # Preview production build
npm run dev          # Development server

# Dependency Management
npm audit            # Check for vulnerabilities
npm outdated         # Check for outdated packages
npm ci               # Clean install (CI/CD)
```

---

## References

- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [React Best Practices](https://react.dev/reference/react)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [OWASP Web Security](https://owasp.org/www-community/)

---

**Last Updated**: April 2026  
**Version**: 1.0  
**Status**: Active
