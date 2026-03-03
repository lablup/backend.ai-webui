# Authentication

Learn how to authenticate with Backend.AI Manager API using various authentication methods.

## Authentication Overview

Backend.AI supports multiple authentication mechanisms:
- **API Keys**: Primary method for programmatic access
- **Session Tokens**: Web UI and temporary access
- **OAuth**: Third-party authentication integration
- **LDAP**: Enterprise directory integration

## API Key Authentication

### Creating API Keys

1. **Through Web UI**:
   - Navigate to User Settings
   - Go to API Keys section
   - Click "Create New Key"
   - Set expiration and permissions

2. **Using CLI**:
   ```bash
   backend.ai admin keypair add \
     --user-id user@example.com \
     --is-active true
   ```

### Using API Keys

Include credentials in API requests:

```bash
# HTTP Header method
curl -H "Authorization: BackendAI signMethod=HMAC-SHA256, \
  credential=AKIAIOSFODNN7EXAMPLE:wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" \
  https://api.backend.ai/v1/auth/test
```

### Authentication Flow
1. Client prepares request with API credentials
2. Server validates signature and permissions
3. API processes request if authentication successful
4. Response returned with appropriate data

## Session Management

### Creating Sessions
```bash
# Create authenticated session
curl -X POST https://api.backend.ai/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password"
  }'
```

### Token Validation
```bash
# Verify token validity
curl -H "Authorization: Bearer $SESSION_TOKEN" \
  https://api.backend.ai/v1/auth/token/verify
```

## Security Best Practices

- **Rotate Keys Regularly**: Change API keys periodically
- **Limit Permissions**: Grant minimum required access
- **Secure Storage**: Protect credentials from exposure
- **Monitor Usage**: Track API key usage and anomalies

## Error Handling

Common authentication errors:
- **401 Unauthorized**: Invalid credentials
- **403 Forbidden**: Insufficient permissions
- **429 Rate Limited**: Too many requests

For detailed API reference, see the [Session Management](sessions.md) documentation.