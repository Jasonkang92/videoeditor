# Frontend State Management Gold Standards

## Table of Contents
1. [State Management Philosophy](#state-management-philosophy)
2. [React Hooks & Local State](#react-hooks--local-state)
3. [Context API Patterns](#context-api-patterns)
4. [Data Fetching Strategies](#data-fetching-strategies)
5. [React Query/TanStack Query](#react-querytanstack-query)
6. [Zustand Pattern](#zustand-pattern)
7. [Form State Management](#form-state-management)
8. [Global State & Persistence](#global-state--persistence)
9. [Performance Optimization](#performance-optimization)
10. [Testing State Management](#testing-state-management)

---

## State Management Philosophy

### Guiding Principles

**Keep state close to usage:** Only lift state when multiple components need it.

```typescript
// ✅ Keep state local when possible
function VideoUpload() {
  const [isDragging, setIsDragging] = useState(false);
  // No other component needs isDragging state
}

// ❌ Avoid lifting unnecessarily
function App() {
  const [isDragging, setIsDragging] = useState(false);  // Prop drilling
  return <VideoUpload isDragging={isDragging} />;
}
```

**Normalize data:** Store data in normalized form, derive views from it.

```typescript
// ❌ Wrong: Duplicate data in different forms
const [videos, setVideos] = useState<Video[]>([]);
const [selectedVideoId, setSelectedVideoId] = useState<string>('');
const selectedVideo = videos.find(v => v.id === selectedVideoId);

// ✅ Right: Single source of truth
interface VideosState {
  byId: Record<string, Video>;
  allIds: string[];
  selectedId?: string;
}
```

**Server is source of truth:** Client state is temporary, server state is canonical.

```typescript
// ✅ Think of client state as cache
interface AppState {
  // Fetched from server
  videos: Video[];
  analysisResults: AnalysisResult[];
  
  // Local UI state only
  isLoading: boolean;
  selectedTab: 'videos' | 'results';
  error?: string;
}
```

---

## React Hooks & Local State

### useState for Simple Values

```typescript
// ✅ Good: Simple, local state
function VideoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0);
  
  return (
    <>
      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
      />
    </>
  );
}
```

### useReducer for Complex State

```typescript
// ✅ Use reducer for multi-field state with complex logic
type AnalysisState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: AnalysisResult;
  error?: string;
};

type AnalysisAction =
  | { type: 'START' }
  | { type: 'SUCCESS'; payload: AnalysisResult }
  | { type: 'ERROR'; payload: string }
  | { type: 'RESET' };

function analysisReducer(
  state: AnalysisState,
  action: AnalysisAction
): AnalysisState {
  switch (action.type) {
    case 'START':
      return { status: 'loading' };
    case 'SUCCESS':
      return { status: 'success', data: action.payload };
    case 'ERROR':
      return { status: 'error', error: action.payload };
    case 'RESET':
      return { status: 'idle' };
    default:
      return state;
  }
}

function AnalysisComponent() {
  const [state, dispatch] = useReducer(analysisReducer, {
    status: 'idle',
  });
  
  return <div>{state.status}</div>;
}
```

### useEffect for Side Effects

```typescript
// ✅ Separate concerns: data, side effects, rendering
function VideoListComponent() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState<string>();

  // Fetch videos on mount
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        setVideos(await response.json());
      } catch (err) {
        setError('Failed to load videos');
      }
    };

    fetchVideos();
  }, []); // Empty deps: run once on mount

  // Cleanup: abort fetch on unmount
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos', {
          signal: controller.signal,
        });
        setVideos(await response.json());
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // Normal abort, don't update state
          return;
        }
        setError(String(err));
      }
    };

    fetchVideos();

    return () => controller.abort();
  }, []);

  return <div>{/* render videos */}</div>;
}
```

---

## Context API Patterns

### When to Use Context

✅ **Good for:**
- Theme/dark mode
- User authentication
- App-wide configuration
- Language/localization

❌ **Don't use for:**
- Frequently changing data (causes re-renders)
- Form data (use local state or React Hook Form)
- List data better served by React Query

### Typed Context

```typescript
// ✅ Strongly typed context
interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Custom hook to use context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used in AuthProvider');
  }
  return context;
}

// ✅ Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const login = async (email: string, password: string) => {
    // Implementation
  };
  
  const logout = () => {
    // Implementation
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Usage in components
function UserProfile() {
  const { user, logout } = useAuth();
  
  if (!user) return <div>Not logged in</div>;
  
  return (
    <div>
      {user.name}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Split Contexts for Performance

```typescript
// ✅ Separate data from dispatch to reduce re-renders
interface UserState {
  users: Record<string, User>;
  loading: boolean;
}

const UserStateContext = createContext<UserState | undefined>(undefined);

interface UserDispatch {
  fetchUsers: () => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
}

const UserDispatchContext = createContext<UserDispatch | undefined>(undefined);

// Only components reading data re-render when data changes
// Components using actions don't re-render unnecessarily
```

---

## Data Fetching Strategies

### Fetch on Mount

```typescript
// ✅ Standard pattern
function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/videos');
        if (!response.ok) throw new Error('Failed to fetch');
        setVideos(await response.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* render videos */}</div>;
}
```

### Dependent API Calls

```typescript
// ✅ Wait for userId, then fetch user data
function UserDashboard({ userId }: { userId?: string }) {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    if (!userId) return; // Skip effect if no userId
    
    const fetchUser = async () => {
      const response = await fetch(`/api/users/${userId}`);
      setUser(await response.json());
    };
    
    fetchUser();
  }, [userId]); // Re-run when userId changes

  return <div>{user?.name}</div>;
}
```

---

## React Query/TanStack Query

### Why Use React Query

- ✅ Automatic request deduplication
- ✅ Built-in caching & background refetching
- ✅ Error handling & retries
- ✅ Pagination/infinite scroll helpers
- ✅ Reduces boilerplate

### Basic Usage

```typescript
// ✅ Simple query
import { useQuery } from '@tanstack/react-query';

function VideosList() {
  const {
    data: videos,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const response = await fetch('/api/videos');
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* render videos */}</div>;
}
```

### Mutations

```typescript
// ✅ Mutations for mutations/side effects
import { useMutation, useQueryClient } from '@tanstack/react-query';

function DeleteVideoButton({ videoId }: { videoId: string }) {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/videos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate(videoId)}
      disabled={mutation.isPending}
    >
      Delete
    </button>
  );
}
```

### Query Invalidation for Sync

```typescript
// ✅ Keep cache fresh when data changes
const queryClient = useQueryClient();

const uploadMutation = useMutation({
  mutationFn: uploadVideo,
  onSuccess: () => {
    // Invalidate video list - will refetch
    queryClient.invalidateQueries({ queryKey: ['videos'] });
  },
});
```

---

## Zustand Pattern

### Lightweight Global State

```typescript
import { create } from 'zustand';

// ✅ Simple, type-safe store
interface AnalysisStore {
  selectedType: AnalysisType;
  setSelectedType: (type: AnalysisType) => void;
  
  results: AnalysisResult[];
  addResult: (result: AnalysisResult) => void;
  clearResults: () => void;
}

const useAnalysisStore = create<AnalysisStore>((set) => ({
  selectedType: 'transcription',
  setSelectedType: (type) => set({ selectedType: type }),
  
  results: [],
  addResult: (result) =>
    set((state) => ({ results: [...state.results, result] })),
  clearResults: () => set({ results: [] }),
}));

// ✅ Usage
function AnalysisComponent() {
  const selectedType = useAnalysisStore((state) => state.selectedType);
  const results = useAnalysisStore((state) => state.results);
  const clearResults = useAnalysisStore((state) => state.clearResults);
  
  return <div>{/* UI */}</div>;
}
```

### Persistence

```typescript
// ✅ Persist to localStorage
const useAuthStore = create<AuthStore>(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-store',
      storage: localStorage,
    }
  )
);
```

---

## Form State Management

### React Hook Form

```typescript
import { useForm, Controller } from 'react-hook-form';

interface VideoUploadFormData {
  title: string;
  file: File;
  analysisType: AnalysisType;
  language?: string;
}

function VideoUploadForm() {
  const { control, handleSubmit, formState: { errors } } = useForm<VideoUploadFormData>({
    defaultValues: {
      title: '',
      analysisType: 'transcription',
    },
  });

  const onSubmit = async (data: VideoUploadFormData) => {
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="title"
        control={control}
        rules={{ required: 'Title is required' }}
        render={({ field }) => (
          <>
            <input {...field} placeholder="Video title" />
            {errors.title && <span>{errors.title.message}</span>}
          </>
        )}
      />
    </form>
  );
}
```

---

## Global State & Persistence

### Storage Patterns

```typescript
// ✅ Persist user preferences
const usePreferences = create<PreferencesStore>(
  persist(
    (set) => ({
      darkMode: false,
      setDarkMode: (enabled) => set({ darkMode: enabled }),
    }),
    {
      name: 'preferences-store',
      storage: localStorage,
    }
  )
);

// ✅ Load on app startup
useEffect(() => {
  const isDark = usePreferences((state) => state.darkMode);
  if (isDark) {
    document.documentElement.classList.add('dark');
  }
}, []);
```

---

## Performance Optimization

### Memoization

```typescript
// ✅ useCallback for stable function references
const VideoPlayer = React.memo(({ videoId }: { videoId: string }) => {
  const handlePlay = useCallback(() => {
    // Play video
  }, [videoId]);

  return <button onClick={handlePlay}>Play</button>;
});

// ✅ useMemo for expensive computations
function VideoStats({ videos }: { videos: Video[] }) {
  const stats = useMemo(() => ({
    total: videos.length,
    avgDuration: videos.reduce((s, v) => s + v.duration, 0) / videos.length,
  }), [videos]);

  return <div>Total: {stats.total}</div>;
}
```

### Selector Optimization with React Query

```typescript
// ✅ Use select to avoid re-renders when other parts of query change
const { data: userName } = useQuery({
  queryKey: ['user', userId],
  queryFn: fetchUser,
  select: (user) => user.name, // Only subscribe to name changes
});
```

---

## Testing State Management

### Testing Context

```typescript
// ✅ Wrap components in provider for testing
import { render, screen } from '@testing-library/react';

it('should show user name from context', () => {
  const testUser: User = { id: '1', name: 'John' };
  
  render(
    <AuthProvider initialUser={testUser}>
      <UserProfile />
    </AuthProvider>
  );
  
  expect(screen.getByText('John')).toBeInTheDocument();
});
```

### Testing Hooks

```typescript
// ✅ Test custom hooks with renderHook
import { renderHook, act } from '@testing-library/react';

it('should add video to store', () => {
  const { result } = renderHook(() => useAnalysisStore());
  
  act(() => {
    result.current.addResult(mockResult);
  });
  
  expect(result.current.results).toHaveLength(1);
});
```

---

## Related Standards
- [003_TESTING_STANDARDS.md](003_TESTING_STANDARDS.md)
- [012_JAVASCRIPT_CODING_STANDARDS.md](012_JAVASCRIPT_CODING_STANDARDS.md)
- [013_CODE_REVIEW_STANDARDS.md](013_CODE_REVIEW_STANDARDS.md)
- [022_API_CLIENT_STANDARDS.md](022_API_CLIENT_STANDARDS.md)

---

**Last Updated:** April 2026
**Status:** Gold Standard
