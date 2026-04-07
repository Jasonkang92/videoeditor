# Architecture Design Document

## Overview

VideoEditor is a collaborative video editing platform with a microservices-inspired architecture, designed for scalability, real-time collaboration, and maintainability.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                              │
│                  (React.js + TypeScript)                      │
│                   Built with Vite                             │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTPS/REST/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                               │
│                    (FastAPI + Python)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Auth API  │  │  Video API  │  │  Project API        │  │
│  │  /auth/*    │  │ /videos/*   │  │  /projects/*        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  User API   │  │ Export API  │  │  Collaboration API  │  │
│  │  /users/*   │  │ /export/*   │  │  /collab/*          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────────┐
        │PostgreSQL│   │  Redis   │   │ File Storage  │
        │ Database │   │  Cache   │   │   (GCS/S3)    │
        └──────────┘   └──────────┘   └──────────────┘
```

## System Components

### Frontend (React.js + TypeScript + Vite)

**Responsibilities:**
- User interface rendering
- Client-side state management with Zustand
- API communication
- Real-time collaboration UI

**Key Modules:**
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── common/     # Buttons, inputs, modals
│   │   ├── editor/     # Video editor components
│   │   └── layout/     # Layout components
│   ├── pages/           # Route pages
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API service layer
│   ├── stores/          # Zustand state management
│   ├── types/           # TypeScript definitions
│   └── utils/           # Utility functions
├── public/              # Static assets
├── package.json         # Dependencies
└── vite.config.ts       # Vite configuration
```

### Backend (FastAPI + Python)

**Responsibilities:**
- RESTful API endpoints
- Business logic
- Authentication & authorization
- Data persistence
- Real-time events (WebSocket)

**Key Modules:**
```
backend/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/    # API route handlers
│   │   │   │   ├── auth.py
│   │   │   │   ├── users.py
│   │   │   │   ├── videos.py
│   │   │   │   ├── projects.py
│   │   │   │   └── export.py
│   │   │   └── router.py      # API router aggregator
│   │   └── deps.py            # Dependencies (auth, db)
│   ├── core/
│   │   ├── config.py          # Application settings
│   │   ├── security.py        # JWT, password hashing
│   │   └── exceptions.py     # Custom exceptions
│   ├── models/               # SQLAlchemy models
│   ├── schemas/              # Pydantic schemas
│   ├── services/             # Business logic layer
│   └── main.py               # Application entry point
├── tests/                    # Tests
├── requirements.txt          # Python dependencies
└── .env.example              # Environment template
```

## Data Models

### User
```
User
├── id: UUID (primary key)
├── email: String (unique)
├── username: String (unique)
├── password_hash: String
├── role: Enum (admin, editor, viewer)
├── created_at: Timestamp
├── updated_at: Timestamp
└── last_login: Timestamp
```

### Project
```
Project
├── id: UUID (primary key)
├── name: String
├── owner_id: UUID (foreign key → User)
├── description: Text
├── settings: JSON
├── created_at: Timestamp
├── updated_at: Timestamp
└── collaborators: List[Collaborator]
```

### Video
```
Video
├── id: UUID (primary key)
├── project_id: UUID (foreign key → Project)
├── filename: String
├── original_filename: String
├── file_path: String (storage path)
├── file_size: Integer (bytes)
├── duration: Float (seconds)
├── format: String
├── status: Enum (uploading, processing, ready, error)
├── metadata: JSON
├── created_at: Timestamp
└── updated_at: Timestamp
```

### Timeline
```
Timeline
├── id: UUID (primary key)
├── project_id: UUID (foreign key → Project)
├── tracks: List[Track]
├── duration: Float
└── created_at: Timestamp

Track
├── id: UUID (primary key)
├── type: Enum (video, audio, text, effects)
├── order: Integer
├── clips: List[Clip]
└── muted: Boolean

Clip
├── id: UUID (primary key)
├── track_id: UUID (foreign key → Track)
├── video_id: UUID (foreign key → Video, nullable)
├── start_time: Float
├── end_time: Float
├── in_point: Float
├── out_point: Float
├── position_x: Float
├── position_y: Float
├── scale: Float
├── rotation: Float
└── effects: JSON
```

## API Design

### Authentication
```
POST   /api/v1/auth/register      # Register new user
POST   /api/v1/auth/login         # Login and get JWT
POST   /api/v1/auth/refresh        # Refresh JWT token
POST   /api/v1/auth/logout         # Logout (invalidate token)
GET    /api/v1/auth/me             # Get current user
```

### Users
```
GET    /api/v1/users               # List users (admin)
GET    /api/v1/users/{id}          # Get user by ID
PUT    /api/v1/users/{id}          # Update user
DELETE /api/v1/users/{id}          # Delete user (admin)
```

### Projects
```
GET    /api/v1/projects            # List user's projects
POST   /api/v1/projects             # Create project
GET    /api/v1/projects/{id}       # Get project details
PUT    /api/v1/projects/{id}       # Update project
DELETE /api/v1/projects/{id}       # Delete project
POST   /api/v1/projects/{id}/collaborators  # Add collaborator
DELETE /api/v1/projects/{id}/collaborators/{user_id}  # Remove collaborator
```

### Videos
```
GET    /api/v1/videos              # List videos
POST   /api/v1/videos/upload        # Upload video
GET    /api/v1/videos/{id}          # Get video details
PUT    /api/v1/videos/{id}          # Update video metadata
DELETE /api/v1/videos/{id}          # Delete video
GET    /api/v1/videos/{id}/thumbnail  # Get video thumbnail
```

### Export
```
POST   /api/v1/export/{project_id}  # Start export job
GET    /api/v1/export/{job_id}       # Get export status
GET    /api/v1/export/{job_id}/download  # Download exported file
```

## Real-time Collaboration

### WebSocket Events
```typescript
// Client → Server
{ type: "join_project", projectId: "uuid" }
{ type: "leave_project", projectId: "uuid" }
{ type: "cursor_move", position: { x, y } }
{ type: "clip_update", clip: { id, changes } }
{ type: "track_update", track: { id, changes } }

// Server → Client
{ type: "user_joined", user: { id, name, color } }
{ type: "user_left", userId: "uuid" }
{ type: "cursor_update", userId: "uuid", position: { x, y } }
{ type: "clip_changed", clip: { id, changes, userId } }
{ type: "track_changed", track: { id, changes, userId } }
{ type: "conflict", resource: "clip", id: "uuid" }
```

## Security Architecture

### Authentication Flow
```
1. User submits credentials
2. Server validates and returns JWT (access + refresh tokens)
3. Client stores tokens securely
4. Access token used in Authorization header
5. Refresh token used to obtain new access token
6. Logout invalidates tokens
```

### Authorization Model
- **RBAC**: Role-Based Access Control
- **Resource Ownership**: Users can only modify their own resources
- **Project Permissions**: Owner, Editor, Viewer roles per project

## Scalability Considerations

### Horizontal Scaling
- Backend instances behind load balancer
- Redis for session/state sharing
- Database connection pooling
- File storage in object store (GCS/S3)

### Performance Optimizations
- Video thumbnail generation
- Lazy loading of project assets
- CDN for static assets
- Database indexing on frequent queries
- Caching frequently accessed data

## Technology Decisions

### Why FastAPI (Python)?
- Async-first for high concurrency
- Automatic OpenAPI documentation
- Pydantic for data validation
- Type hints for code quality
- Native WebSocket support
- Fast performance

### Why React.js + TypeScript?
- Component-based architecture
- Strong typing with TypeScript
- Large ecosystem and community
- Excellent developer experience
- Hot Module Replacement (HMR) with Vite
- Built-in testing utilities

### Why PostgreSQL?
- JSON support for flexible metadata
- Strong consistency
- Full-text search capability
- Robust indexing

### Why Redis?
- Real-time collaboration state
- Session caching
- Rate limiting

---

**Document Version**: 1.0
**Last Updated**: April 2026
