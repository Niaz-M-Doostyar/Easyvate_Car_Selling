# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

The Easyvate Car Selling Platform team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings.

### Please do NOT:
- Open a public GitHub issue for security vulnerabilities
- Discuss the vulnerability publicly until it has been addressed

### Please DO:
- Email security details to: niaz.doostyar@example.com
- Provide detailed information about the vulnerability
- Include steps to reproduce if possible
- Allow reasonable time for us to respond before public disclosure

### What to Include:
- Type of vulnerability (e.g., SQL injection, XSS, authentication bypass)
- Full paths of source file(s) related to the manifestation of the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline:
- We will acknowledge your email within 48 hours
- We will provide a detailed response within 7 days
- We will work on a fix and coordinate disclosure timing with you
- We will credit you in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices

When deploying this application:

### Backend
- Change all default passwords and secrets
- Use strong JWT secrets (minimum 32 characters)
- Enable HTTPS in production
- Keep dependencies updated
- Use environment variables for sensitive data
- Implement rate limiting
- Enable CORS properly
- Sanitize all user inputs
- Use prepared statements (Sequelize ORM handles this)

### Frontend
- Never expose API keys in client-side code
- Implement proper authentication checks
- Validate user inputs on both client and server
- Use HTTPS only in production
- Implement CSP headers

### Database
- Use strong database passwords
- Limit database user permissions
- Enable MySQL secure installation
- Regular backups
- Use encrypted connections

### General
- Keep Node.js and npm packages updated
- Run `npm audit` regularly
- Use a Web Application Firewall (WAF)
- Implement logging and monitoring
- Regular security audits

## Known Security Considerations

1. **Authentication**: Uses JWT tokens with expiration
2. **Password Storage**: Bcrypt hashing with salt rounds
3. **SQL Injection**: Protected via Sequelize ORM
4. **XSS**: React/Next.js built-in protection
5. **CSRF**: Token-based API prevents CSRF attacks

## Updates

This policy may be updated from time to time. Please check back regularly.

---
Last Updated: February 2026
