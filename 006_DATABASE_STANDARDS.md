# Database Standards

## Table of Contents
1. [Schema Design](#schema-design)
2. [Migration Procedures](#migration-procedures)
3. [Indexing Strategy](#indexing-strategy)
4. [Query Performance](#query-performance)
5. [Backup & Recovery](#backup--recovery)
6. [Data Retention & Archival](#data-retention--archival)
7. [Replication & High Availability](#replication--high-availability)
8. [Connection Management](#connection-management)
9. [Transactions](#transactions)
10. [Monitoring & Optimization](#monitoring--optimization)

---

## Schema Design

### Naming Conventions

```sql
-- Tables: lowercase with underscores, plural
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  ...
);

-- Columns: lowercase with underscores
CREATE TABLE video_transcriptions (
  id BIGSERIAL PRIMARY KEY,
  video_id INTEGER NOT NULL REFERENCES videos(id),
  transcription_text TEXT,
  confidence_score DECIMAL(3, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Foreign keys: {table_name}_id
user_id INTEGER REFERENCES users(id),
video_id INTEGER REFERENCES videos(id),

-- Boolean columns: is_* or has_*
is_active BOOLEAN DEFAULT TRUE,
has_transcription BOOLEAN DEFAULT FALSE,

-- Status enums
status VARCHAR(50) CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
```

### Data Types

```sql
-- ✅ Use appropriate types
SERIAL / BIGSERIAL        -- Auto-incrementing integers
UUID                      -- Distributed IDs
TEXT / VARCHAR            -- Strings
DECIMAL(precision, scale) -- Money/percentages
TIMESTAMP                 -- DateTime
BOOLEAN                   -- True/False
JSONB                     -- JSON with indexing support
ARRAY                     -- Lists

-- ❌ Avoid
INT for large numbers     -- Use BIGINT
FLOAT for money           -- Use DECIMAL
TEXT for enums            -- Use ENUM or CHECK

-- Example table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes BIGINT NOT NULL,
  status VARCHAR(50) DEFAULT 'created' CHECK (status IN ('created', 'processing', 'completed', 'failed')),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Migration Procedures

### Alembic Migration Management (Python)

```bash
# Initialize migrations
alembic init migrations

# Create migration
alembic revision --autogenerate -m "add_videos_table"

# Review migration file
cat alembic/versions/xxx_add_videos_table.py

# Test locally
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Migration Template

```python
# migrations/versions/001_add_videos_table.py
from alembic import op
import sqlalchemy as sa

def upgrade():
    """Add videos table."""
    op.create_table(
        'videos',
        sa.Column('id', sa.UUID, primary_key=True, default=sa.text('gen_random_uuid()')),
        sa.Column('owner_id', sa.UUID, nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('created_at', sa.TIMESTAMP, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'])
    )
    op.create_index('idx_videos_owner_id', 'videos', ['owner_id'])

def downgrade():
    """Remove videos table."""
    op.drop_table('videos')
```

### Zero-Downtime Migrations

```python
# Bad: Locks table during migration
ALTER TABLE videos 
RENAME COLUMN video_title TO title;

# Good: Create new column, migrate data, swap
# Step 1: Create new column
ALTER TABLE videos ADD COLUMN title VARCHAR(255);

# Step 2: Migrate data (in batches if large table)
UPDATE videos SET title = video_title WHERE title IS NULL LIMIT 1000;

# Step 3: After migration complete, drop old column
ALTER TABLE videos DROP COLUMN video_title;
```

---

## Indexing Strategy

### Indexing Guidelines

```sql
-- ✅ Index foreign keys
CREATE INDEX idx_videos_owner_id ON videos(owner_id);

-- ✅ Index frequently filtered columns
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);

-- ✅ Composite indexes for common queries
CREATE INDEX idx_videos_owner_status ON videos(owner_id, status);

-- ✅ JSONB indexes
CREATE INDEX idx_videos_metadata_gin ON videos USING GIN (metadata);

-- ✅ Partial indexes for sparse data
CREATE INDEX idx_completed_videos ON videos(id) WHERE status = 'completed';

-- ❌ Don't index everything
-- SELECT * queries don't benefit
-- Indexes slow down writes
```

### Index Monitoring

```sql
-- Check index usage
SELECT 
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find unused indexes
SELECT schemaname, tablename, indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0;

-- Check index size
SELECT 
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
```

---

## Query Performance

### Query Optimization

```sql
-- ❌ Bad: N+1 query problem
SELECT * FROM videos;
-- Then in code: for each video, fetch owner
SELECT * FROM users WHERE id = video['owner_id'];

-- ✅ Good: Join
SELECT v.*, u.name FROM videos v
JOIN users u ON v.owner_id = u.id;

-- ✅ Use EXPLAIN to analyze
EXPLAIN ANALYZE
SELECT * FROM videos WHERE status = 'completed' ORDER BY created_at DESC LIMIT 10;

-- ✅ Add WHERE clauses
SELECT * FROM videos WHERE owner_id = $1 AND status = 'completed';

-- ❌ Avoid: SELECT * without LIMIT
SELECT * FROM large_videos_table;  -- Could return 1M rows

-- ✅ Use pagination
SELECT * FROM videos OFFSET 100 LIMIT 10;
```

### Slow Query Logging

```python
# PostgreSQL configuration
# postgresql.conf
log_min_duration_statement = 1000  # Log queries > 1 second

# Or enable in auto_explain module
CREATE EXTENSION pg_stat_statements;

SELECT 
  query,
  mean_time,
  calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Backup & Recovery

### Backup Strategy

```
Frequency: Daily automated backups
Retention: 
  - 7 daily backups
  - 4 weekly backups
  - 12 monthly backups (1 year total)

Location: Off-site (cloud storage or second data center)

Recovery Time Objective (RTO): 1 hour
Recovery Point Objective (RPO): 1 hour
```

### Automated Backup (Python)

```python
import subprocess
from datetime import datetime
import boto3

def backup_database():
    """Backup PostgreSQL database to S3."""
    backup_file = f"backup-{datetime.now().isoformat()}.sql.gz"
    
    # Dump database
    subprocess.run([
        "pg_dump",
        os.getenv("DATABASE_URL"),
        "|", "gzip"
    ], stdout=open(backup_file, 'w'))
    
    # Upload to S3
    s3 = boto3.client('s3')
    s3.upload_file(
        backup_file,
        'my-backups',
        f"database/{backup_file}"
    )
    
    # Verify backup can be restored
    subprocess.run([
        "zcat", backup_file,
        "|", "psql",
        "--dry-run",  # Don't actually restore
        os.getenv("DATABASE_URL")
    ])
    
    logger.info(f"Backup completed: {backup_file}")
```

### Recovery Procedure

```bash
# 1. Stop application
kubectl scale deployment/api --replicas=0

# 2. List available backups
aws s3 ls s3://my-backups/database/

# 3. Download backup
aws s3 cp s3://my-backups/database/backup-2026-04-06T10:00:00.sql.gz .

# 4. Restore database
zcat backup-2026-04-06T10:00:00.sql.gz | psql $DATABASE_URL

# 5. Verify integrity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM videos;"

# 6. Restart application
kubectl scale deployment/api --replicas=3
```

---

## Data Retention & Archival

### Retention Policy

```
Active Data:
- User accounts: Keep indefinitely
- Videos: Keep for minimum 1 year
- Transcriptions: Keep for minimum 2 years
- Audit logs: Keep for 3+ years (compliance)

Archival:
- Videos not accessed for 1 year: Move to cold storage
- Log files older than 1 year: Compress and archive
- Deleted users: Soft delete (flag inactive) for 90 days, then purge

Deletion:
- Failed jobs: 30 days
- Temporary files: 7 days
- API tokens: Upon expiration
```

### Data Retention Implementation

```python
from datetime import datetime, timedelta
from sqlalchemy import and_

def archive_old_videos():
    """Archive videos not accessed for 1 year."""
    cutoff_date = datetime.utcnow() - timedelta(days=365)
    
    videos = db.query(Video).filter(
        and_(
            Video.last_accessed < cutoff_date,
            Video.archived == False
        )
    ).all()
    
    for video in videos:
        # Move to cold storage
        move_to_s3_glacier(video.file_path)
        video.archived = True
        video.archived_at = datetime.utcnow()
        db.commit()
        
    logger.info(f"Archived {len(videos)} videos")

def purge_deleted_users():
    """Permanently delete soft-deleted users after grace period."""
    cutoff_date = datetime.utcnow() - timedelta(days=90)
    
    users = db.query(User).filter(
        and_(
            User.deleted_at < cutoff_date,
            User.deleted_at.isnot(None)
        )
    ).all()
    
    for user in users:
        delete_user_data(user.id)
        db.delete(user)
    
    db.commit()
    logger.info(f"Purged {len(users)} deleted users")
```

---

## Replication & High Availability

### PostgreSQL Replication

```
Primary DB (read/write)
    |
    ├── Replica 1 (read-only)
    ├── Replica 2 (read-only)
    └── Replica 3 (read-only)

WAL (Write-Ahead Log) shipped to replicas
Automatic failover if primary fails
```

### Connection Pool Configuration

```python
from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    pool_size=20,           # Connections to keep in pool
    max_overflow=10,        # Additional connections allowed
    pool_pre_ping=True,     # Test connections before using
    pool_recycle=3600,      # Recycle connections after 1 hour
    connect_args={
        "timeout": 10,      # Connection timeout
        "sslmode": "require" # Always use SSL
    }
)
```

---

## Monitoring & Optimization

### Database Health Checks

```python
async def check_database_health() -> Dict:
    """Check database health and performance."""
    try:
        # Connection test
        await db.execute("SELECT 1")
        
        # Query performance
        result = await db.execute("""
            SELECT max(mean_time) FROM pg_stat_statements
        """)
        max_query_time = result.scalar()
        
        # Table bloat
        result = await db.execute("""
            SELECT tablename FROM pg_stat_user_tables
            WHERE n_dead_tup > 10000
        """)
        bloated_tables = result.fetchall()
        
        return {
            "status": "healthy",
            "latency_ms": 15,
            "max_query_time_ms": max_query_time,
            "bloated_tables": len(bloated_tables)
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

---

**Last Updated**: April 2026  
**Version**: 1.0  
**Status**: Active
