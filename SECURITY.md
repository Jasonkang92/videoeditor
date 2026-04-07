# Security Policy

## Supported Versions

We actively support and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report them via:

1. **Email**: Send a detailed description to the security team
2. **Private Vulnerability Reporting**: Use GitHub's [Private vulnerability reporting](https://github.com/Jasonkang92/videoeditor/security/advisories/new) feature

### What to Include

When reporting a vulnerability, please include:

- Type of vulnerability (e.g., XSS, SQL injection, CSRF)
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact assessment of the vulnerability

### Response Timeline

- **Initial Response**: Within 48 hours
- **Assessment**: Within 7 days
- **Fix Development**: Variable based on complexity
- **Disclosure**: After fix is deployed

## Security Best Practices

This project follows security best practices as documented in `000_SECURITY_CODING_STANDARDS.md`. Key areas include:

### Authentication & Authorization
- JWT-based authentication with secure token handling
- Password hashing using bcrypt
- Role-based access control (RBAC)
- Resource-level authorization checks

### Data Protection
- All sensitive data encrypted at rest
- TLS/SSL for data in transit
- Environment variables for secrets (never committed to code)
- Secure session management

### API Security
- CORS configuration with allowlist
- Rate limiting on all endpoints
- Input validation and sanitization
- SQL injection prevention via parameterized queries
- XSS prevention with output encoding

### Dependency Security
- Regular dependency audits (`npm audit`, `pip-audit`)
- Dependency vulnerability scanning (Dependabot)
- Minimal dependency footprint
- Regular security updates

## Environment Variables

Never commit the following to version control:

```
# Backend (.env)
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET_KEY=your_secret_key_here
GOOGLE_API_KEY=your_api_key_here
STRIPE_SECRET_KEY=sk_live_xxx

# Frontend (.env.local)
VITE_API_URL=https://api.example.com
```

See `.env.example` files for the list of required variables.

## Compliance

This project complies with:
- OWASP Top 10 security guidelines
- GDPR data protection requirements
- Industry-standard security protocols

## Security Updates

Security updates are released as patch versions and announced through:
- GitHub Security Advisories
- Project release notes

## Scope

This security policy applies to:
- The main repository code
- Official releases and branches
- Documentation

It does NOT cover:
- Forked repositories
- Third-party integrations (use their respective security policies)
- User-deployed instances (operators are responsible for their own security)

## Acknowledgments

We appreciate the security research community's efforts in responsibly disclosing vulnerabilities. Contributors will be acknowledged (if desired) in our security advisory.

---

**Document Version**: 1.0
**Last Updated**: April 2026
