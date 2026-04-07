# Compliance & Data Privacy Standards

## Table of Contents
1. [GDPR Compliance](#gdpr-compliance)
2. [Data Classification](#data-classification)
3. [Data Retention](#data-retention)
4. [User Consent Management](#user-consent-management)
5. [Data Subject Rights](#data-subject-rights)
6. [PII Protection](#pii-protection)
7. [Audit Logging](#audit-logging)
8. [Privacy by Design](#privacy-by-design)
9. [Third-Party Compliance](#third-party-compliance)
10. [Compliance Checklist](#compliance-checklist)

---

## GDPR Compliance

### GDPR Overview (EU)

```
Applies if:
- Business is in EU, or
- Service offered to EU residents, or
- Collect behavioral data of EU residents

Key Requirements:
- Valid legal basis for data processing
- User consent for non-essential processing
- Privacy Policy accessible and clear
- Data processing agreements with vendors
- Data breach notification within 72 hours
- Data Protection Impact Assessment (DPIA) for high-risk processing
```

### Data Processing Agreements

```markdown
# Data Processing Agreement Template

## 1. Parties
- Data Controller: Your Company
- Data Processor: Service Provider

## 2. Subject Matter
- Processing of user data for video analytics
- Categories of data: emails, user preferences, videos, transcriptions
- Duration: From contract start until termination

## 3. Data Controller Obligations
- Provide legal basis for processing
- Notify processor of changes to processing
- Provide data to processor in compliant manner

## 4. Data Processor Obligations
- Process data only on controller's instructions
- Ensure authorized staff are bound by confidentiality
- Implement appropriate technical and organizational measures
- Assist with data subject rights requests
- Delete or return data upon controller request

## 5. Sub-contractors
- Processor shall not engage sub-contractors without authorization
- Processor remains liable for sub-contractor performance

## 6. Assistance with Data Subject Rights
- Processor will assist with:
  - Access requests
  - Correction requests
  - Deletion requests
  - Portability requests

## 7. Term and Termination
- Term: As long as services are provided
- Upon termination: Delete or return user data
```

---

## Data Classification

### Data Categories

```
Public Data:
- Marketing materials
- Public documentation
- Non-sensitive product information
- Requires: Access control, integrity

Internal Data:
- Internal documentation
- Employee information
- Business metrics
- Requires: Access control, authentication, encryption at rest

Sensitive Data:
- User emails
- User preferences
- Video content
- Requires: Encryption at rest + transit, access logs, purpose limitation

Highly Sensitive (PII):
- Passwords, API keys (never stored!)
- Payment information
- Social security numbers
- Biometric data
- Requires: Encryption, minimal retention, strict access control
```

### Data Classification Policy

```
Policy for Each Data Type:
1. Who can access (role-based)
2. Where stored (database, cache, logs)
3. Encryption requirements
4. Retention period
5. Deletion procedure
6. Audit logging
7. Backup requirements
```

---

## Data Retention

### Retention Schedule

```
User Accounts:
- Active account: Keep indefinitely
- Deleted account: Purge after 90 days
- Inactive (2+ years): Archive or delete

Videos:
- Stored: Keep for 2 years minimum, offer deletion after 1 year
- Processing logs: 90 days
- Transcriptions: 2 years minimum

User Analytics:
- Session logs: 30 days
- User behavior: 90 days
- Aggregated analytics: 1 year

Audit Logs:
- Authentication events: 3 years
- Data access logs: 3 years
- Admin actions: 3 years
- Security events: 3 years (or indefinitely for incidents)

API Keys/Tokens:
- Valid tokens: 24 hours max lifetime
- Revoked tokens: Delete after 1 hour
- Refresh tokens: Delete after 30 days of disuse
```

### Retention Implementation

```python
from datetime import datetime, timedelta
from sqlalchemy import and_

def delete_expired_data():
    """Delete data past retention period."""
    
    # Delete old session logs
    cutoff = datetime.utcnow() - timedelta(days=30)
    db.query(SessionLog).filter(SessionLog.created_at < cutoff).delete()
    
    # Delete old API logs
    cutoff = datetime.utcnow() - timedelta(days=90)
    db.query(APILog).filter(APILog.created_at < cutoff).delete()
    
    # Purge deleted accounts
    cutoff = datetime.utcnow() - timedelta(days=90)
    db.query(User).filter(
        and_(
            User.deleted_at < cutoff,
            User.deleted_at.isnot(None)
        )
    ).delete()
    
    db.commit()
    logger.info("Expired data deleted")

# Schedule daily at midnight
scheduler.add_job(delete_expired_data, 'cron', hour=0)
```

---

## User Consent Management

### Consent Types (GDPR)

```
Explicit Consent (Required for):
- Marketing emails
- Non-essential cookies
- Third-party data sharing
- Special processing

Implicit Consent (From usage):
- Essential cookies
- System logs
- Service improvement analytics
- Security monitoring

Documentation:
- Show what user is consenting to
- Explain how data is used
- Date and method of consent
- Clear language (no legal jargon)
```

### Consent Implementation

```python
from enum import Enum
from datetime import datetime

class ConsentType(Enum):
    MARKETING = "marketing"
    ANALYTICS = "analytics"
    THIRD_PARTY = "third_party"
    COOKIES = "cookies"

class UserConsent(db.Model):
    """Track user consent."""
    id = db.Column(UUID, primary_key=True)
    user_id = db.Column(UUID, ForeignKey('users.id'), nullable=False)
    consent_type = db.Column(String, nullable=False)
    granted = db.Column(Boolean, default=False)
    consent_date = db.Column(DateTime, default=datetime.utcnow)
    ip_address = db.Column(String)
    user_agent = db.Column(String)

@app.post("/api/v1/consent")
async def update_consent(
    consent_type: ConsentType,
    granted: bool,
    current_user: dict = Depends(get_current_user)
):
    """Update user consent."""
    consent = UserConsent(
        user_id=current_user["id"],
        consent_type=consent_type.value,
        granted=granted,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    db.add(consent)
    db.commit()
    
    # Log for audit
    logger.info(f"Consent updated: {consent_type.value} = {granted}")
    
    return {"status": "updated"}

# Only process if consent granted
async def send_marketing_email(user_id):
    consent = db.query(UserConsent).filter(
        UserConsent.user_id == user_id,
        UserConsent.consent_type == "marketing"
    ).first()
    
    if not consent or not consent.granted:
        return {"status": "skipped", "reason": "no_consent"}
    
    send_email(user_id)
```

---

## Data Subject Rights

### GDPR Rights (7 Total)

```
1. Right of Access
   - User can request all personal data
   - Must provide within 30 days
   - Include: origin, purpose, recipients, retention

2. Right of Rectification
   - User can request correction of inaccurate data
   - Processor must update within reasonable time

3. Right to Erasure ("Right to be Forgotten")
   - User can request deletion of personal data
   - Exceptions: Legal obligation, public interest
   - Must delete within 30 days

4. Right to Restrict Processing
   - User can request limiting how data is used
   - Example: Marketing paused but data retained

5. Right to Data Portability
   - User can request data in machine-readable format
   - Must provide within 30 days
   - Usually JSON or CSV

6. Right to Object
   - User can object to:
     - Marketing processing
     - Profiling
     - Automated decision-making

7. Rights Related to Automated Decision-Making
   - User has right not to be subject to automated decisions
   - Example: Algorithmic content filtering
```

### Implementation Example

```python
@app.post("/api/v1/user/data-export")
async def export_user_data(current_user: dict = Depends(get_current_user)):
    """Export user's personal data (Right to Portability)."""
    user_id = current_user["id"]
    
    # Collect all user data
    user_data = {
        "user": get_user_details(user_id),
        "videos": get_user_videos(user_id),
        "transcriptions": get_user_transcriptions(user_id),
        "preferences": get_user_preferences(user_id),
        "activity": get_user_activity_log(user_id),
    }
    
    # Export as JSON
    export_file = f"user_export_{user_id}.json"
    with open(export_file, 'w') as f:
        json.dump(user_data, f, indent=2)
    
    # Log for audit
    logger.info(f"User data exported for: {user_id}")
    
    # Return file for download
    return FileResponse(export_file, filename=export_file)

@app.post("/api/v1/user/delete")
async def request_deletion(current_user: dict = Depends(get_current_user)):
    """Request account deletion (Right to Erasure)."""
    user_id = current_user["id"]
    
    # Send confirmation email
    send_deletion_confirmation_email(user_id)
    
    # Mark for deletion (30 day grace period)
    user = get_user(user_id)
    user.deletion_requested_at = datetime.utcnow()
    user.deletion_requested = True
    db.commit()
    
    logger.info(f"Deletion requested by user: {user_id}")
    
    return {
        "status": "deletion_requested",
        "message": "Please confirm deletion in email. Account will be deleted in 30 days."
    }
```

---

## PII Protection

### Handling Personally Identifiable Information

```python
import hashlib
from cryptography.fernet import Fernet

ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
cipher = Fernet(ENCRYPTION_KEY)

# ✅ Never log PII
def bad_log(user):
    logger.info(f"User {user.email} logged in")  # ❌ Logs email

def good_log(user):
    logger.info(f"User logged in", extra={"user_id": user.id})  # ✅ Logs only ID

# ✅ Hash passwords
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

# ✅ Encrypt sensitive fields
def encrypt_ssn(ssn: str) -> str:
    return cipher.encrypt(ssn.encode()).decode()

def decrypt_ssn(encrypted: str) -> str:
    return cipher.decrypt(encrypted.encode()).decode()

# ✅ Minimize PII collection
# - Only collect data you need
# - Remove email from logs
# - Use user IDs instead of emails in queries
# - Hash for searches: hash_email = hash(user.email)

# ✅ Anonymize for analytics
import hashlib

def anonymize_email(email: str) -> str:
    """Create pseudo-anonymous hash for analytics."""
    return hashlib.sha256(email.encode()).hexdigest()

# ✅ Pseudonymization
def pseudonymize_user_data(user_data: dict) -> dict:
    """Replace identifiable fields with pseudonyms."""
    return {
        "user_pseudo_id": hash(user_data["email"]),
        "video_count": len(user_data.get("videos", [])),
        "account_age_days": calculate_days(user_data["created_at"]),
        # Removed: email, name, phone
    }
```

---

## Audit Logging

### Audit Log Requirements

```
What to Log:
- Data access (who accessed what, when)
- Data modifications (who changed what, when)
- Authentication events (login, logout, failed attempts)
- Authorization decisions (who was allowed/denied)
- Administrative actions (user creation, role changes)
- Security events (failed validations, suspicious activity)
- Consent changes (user withdrew/granted consent)

What NOT to log:
- Passwords
- API keys
- Payment information
- Full credit card numbers
```

### Audit Log Implementation

```python
from datetime import datetime
from enum import Enum

class AuditAction(Enum):
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    EXPORT = "export"

class AuditLog(db.Model):
    """Immutable audit log."""
    id = db.Column(UUID, primary_key=True, default=uuid4)
    timestamp = db.Column(DateTime, default=datetime.utcnow, nullable=False)
    user_id = db.Column(UUID, index=True)
    action = db.Column(String, nullable=False)
    resource_type = db.Column(String)  # 'user', 'video', etc.
    resource_id = db.Column(String, index=True)
    ip_address = db.Column(String)
    status = db.Column(String)  # 'success' or 'failure'
    details = db.Column(JSON)
    
    __table_args__ = (
        db.Index('idx_audit_timestamp', 'timestamp'),
        db.Index('idx_audit_user', 'user_id'),
    )

def log_audit(
    action: AuditAction,
    resource_type: str,
    resource_id: str,
    user_id: str = None,
    status: str = "success",
    details: dict = None
):
    """Log action for audit trail."""
    audit = AuditLog(
        timestamp=datetime.utcnow(),
        user_id=user_id,
        action=action.value,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=get_client_ip(),
        status=status,
        details=details or {}
    )
    db.add(audit)
    db.commit()
    
    # Also write to immutable log file/storage
    logger.info(f"AUDIT: {action.value} {resource_type} {resource_id}")
```

---

## Privacy by Design

### Privacy as Default

```python
# Principle 1: Data Minimization
# Only collect what you need
class UserProfile(db.Model):
    email = db.Column(String)           # ✓ Need for contact
    password_hash = db.Column(String)   # ✓ Need for auth
    # No: phone, address, SSN           # ✗ Don't collect unnecessary

# Principle 2: Purpose Limitation
# Use data only for stated purpose
def send_marketing_email(user_id):
    # ✓ OK: User consented to marketing
    send_email(user_id, marketing_content)

def improve_transcription(user_id, transcription):
    # ✗ NOT OK: Using marketing email list for ML training
    # must have separate consent

# Principle 3: Storage Limitation
# Delete after retention period
def cleanup_old_videos():
    cutoff = datetime.utcnow() - timedelta(days=365)
    old_videos = db.query(Video).filter(Video.created_at < cutoff)
    for video in old_videos:
        delete_video_file(video.file_path)
        db.delete(video)

# Principle 4: Integrity and Confidentiality
# Secure processing
def safe_store_data(data):
    encrypted = encrypt(data)
    store_encrypted_in_db(encrypted)
```

---

## Third-Party Compliance

### Vendor Assessment

```markdown
# Third-Party Data Processing Agreement

Before integrating external service:

1. Data Processing Agreement
   - [ ] Provider has signed DPA
   - [ ] Covers GDPR compliance
   - [ ] Specifies data types processed
   - [ ] Includes sub-processor clause

2. Privacy Policy Review
   - [ ] Clear about data usage
   - [ ] Specifies retention period
   - [ ] Transparency about sharing
   - [ ] User rights documented

3. Security Assessment
   - [ ] SOC 2 certification (or equivalent)
   - [ ] Data encryption in transit
   - [ ] Regular security audits
   - [ ] Incident response plan

4. Compliance Certifications
   - [ ] GDPR compliant
   - [ ] ISO 27001 certified
   - [ ] HIPAA compliant (if medical)
   - [ ] CCPA compliant (if California)

5. Contract Terms
   - [ ] Right to audit
   - [ ] Data deletion upon request
   - [ ] Breach notification provision
```

### Managing Third Parties

```python
# Track third-party integrations
THIRD_PARTY_SERVICES = {
    "google_speech": {
        "dpa_signed": True,
        "dpa_date": "2024-01-15",
        "data_categories": ["audio_files"],
        "location": "US/EU",
        "contact": "compliance@google.com"
    },
    "stripe": {
        "dpa_signed": True,
        "data_categories": ["payment_info"],
        "pci_dss": True,
        "review_date": "2024-06-15"
    },
}

# Audit third-party compliance
def audit_third_party_compliance():
    for service, details in THIRD_PARTY_SERVICES.items():
        # Check DPA is signed
        if not details.get("dpa_signed"):
            logger.warning(f"{service} DPA not signed")
        
        # Check review dates not stale
        review_date = datetime.fromisoformat(details.get("review_date"))
        if (datetime.now() - review_date).days > 365:
            logger.warning(f"{service} review date is stale")
```

---

## Compliance Checklist

### Pre-Launch

- [ ] Privacy Policy drafted and reviewed
- [ ] Terms of Service finalized
- [ ] GDPR Data Processing Agreement signed
- [ ] Consent management system implemented
- [ ] Data retention policy documented
- [ ] Audit logging configured
- [ ] Encryption enabled for PII
- [ ] Access controls implemented
- [ ] Security assessment completed
- [ ] DPIA completed for high-risk processing
- [ ] Legal review completed

### Post-Launch (Ongoing)

- [ ] User consent tracking functional
- [ ] Data export feature working
- [ ] Deletion requests processed within 30 days
- [ ] Audit logs maintained
- [ ] Third-party DPAs current
- [ ] Security updates applied
- [ ] Data breach response plan documented
- [ ] Privacy impact assessments updated
- [ ] Compliance training completed

---

**Last Updated**: April 2026  
**Version**: 1.0  
**Status**: Active
