# User Registration

Learn how to register and manage user accounts in Backend.AI, including user creation, account activation, and initial setup procedures.

## User Registration Methods

### Administrative Registration

Administrators can create user accounts directly:

1. **Navigate to User Management**:
   - Go to the Admin menu
   - Select "User Management"
   - Click "Add User"

2. **Enter User Details**:
   - Email address (will be the username)
   - Full name and organization
   - Initial role assignment
   - Domain association

3. **Set Account Options**:
   - Account activation method
   - Initial password policy
   - Resource quota assignments
   - Group memberships

### Self-Registration

Configure self-registration for users:

1. **Enable Self-Registration**:
   ```toml
   [webserver]
   allow_signup = true
   signup_requires_approval = false
   ```

2. **Configure Email Verification**:
   ```toml
   [email]
   smtp_host = "smtp.gmail.com"
   smtp_port = 587
   smtp_user = "your-email@example.com"
   smtp_password = "your-app-password"
   ```

3. **Set Registration Policies**:
   - Domain restrictions
   - Approval workflows
   - Default resource limits
   - Initial group assignments

## Account Creation Process

### Step 1: Basic Information

Required user information:
- **Email Address**: Unique identifier and login
- **Full Name**: Display name for the user
- **Organization**: Company or institution
- **Phone Number**: Optional contact information

### Step 2: Security Settings

Configure security parameters:
- **Password Policy**: Minimum requirements
- **Two-Factor Authentication**: Enable/disable 2FA
- **Session Timeout**: Idle timeout settings
- **Login Restrictions**: IP address limitations

### Step 3: Resource Allocation

Set initial resource limits:
- **CPU Cores**: Maximum concurrent cores
- **Memory**: RAM allocation limits
- **GPU Access**: Graphics processing availability
- **Storage Quota**: Persistent storage limits

### Step 4: Group Assignment

Assign users to appropriate groups:
- **Project Groups**: Project-specific access
- **Resource Groups**: Shared resource pools
- **Permission Groups**: Role-based access control
- **Billing Groups**: Cost allocation and tracking

## User Activation

### Email Activation

For email-based activation:
1. User receives activation email
2. Clicks activation link
3. Sets initial password
4. Completes profile setup
5. Account becomes active

### Administrative Activation

For admin-controlled activation:
1. Admin reviews registration request
2. Approves or denies the request
3. Sets initial credentials
4. Notifies user of account creation
5. User logs in with provided credentials

## Bulk User Registration

### CSV Import

Import multiple users from CSV files:

```csv
email,name,organization,role,domain
john.doe@example.com,John Doe,ACME Corp,user,default
jane.smith@example.com,Jane Smith,ACME Corp,admin,default
```

Import process:
1. Upload CSV file through admin interface
2. Map CSV columns to user fields
3. Preview import results
4. Execute bulk import
5. Send activation emails

### API-Based Registration

Automate registration through REST API:

```bash
# Create new user
curl -X POST \
  https://api.backend.ai/v1/auth/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "New User",
    "organization": "Example Corp",
    "role": "user",
    "domain": "default"
  }'
```

## User Profile Management

### Profile Configuration

Users can update their profiles:
- **Personal Information**: Name, contact details
- **Organization Details**: Department, role
- **Preferences**: Language, timezone, notifications
- **Security Settings**: Password, 2FA, API keys

### Access Control

Configure user access levels:
- **Domain Access**: Multi-domain environments
- **Project Permissions**: Project-specific roles
- **Resource Limits**: Computing resource quotas
- **Feature Access**: Available platform features

## Integration with External Systems

### LDAP Integration

Connect with enterprise LDAP:
```toml
[auth]
backend = "ldap"
ldap_host = "ldap.company.com"
ldap_port = 389
ldap_bind_dn = "CN=service,OU=accounts,DC=company,DC=com"
ldap_search_base = "OU=users,DC=company,DC=com"
ldap_search_filter = "(sAMAccountName={username})"
```

### OAuth/SAML Integration

Support for single sign-on:
- **Google OAuth**: Google Workspace integration
- **Microsoft Azure AD**: Enterprise authentication
- **Custom SAML**: Organization-specific IdP
- **GitHub OAuth**: Developer-focused authentication

### API Integration

Programmatic user management:
- **REST API**: Full user management capabilities
- **GraphQL API**: Flexible query interface
- **Webhooks**: Event-driven integrations
- **CLI Tools**: Command-line user operations

## Account Lifecycle Management

### User Onboarding

Streamline new user setup:
1. **Welcome Email**: Introduction and getting started guide
2. **Tutorial Sessions**: Hands-on learning environment
3. **Resource Allocation**: Initial quotas and permissions
4. **Team Assignment**: Project and group membership

### Account Maintenance

Ongoing account management:
- **Regular Access Reviews**: Periodic permission audits
- **Usage Monitoring**: Resource consumption tracking
- **Policy Updates**: Security and compliance changes
- **Training Programs**: Ongoing education and updates

### Account Deactivation

Proper offboarding procedures:
1. **Data Backup**: Preserve user data if required
2. **Access Revocation**: Remove all permissions
3. **Resource Cleanup**: Free allocated resources
4. **Audit Trail**: Maintain deactivation records

## Security Considerations

### Password Policies

Implement strong password requirements:
- **Minimum Length**: 8-12 character minimum
- **Complexity**: Numbers, symbols, mixed case
- **History**: Prevent password reuse
- **Expiration**: Regular password changes

### Account Security

Protect user accounts:
- **Failed Login Protection**: Account lockout policies
- **Suspicious Activity Monitoring**: Unusual login patterns
- **Regular Audits**: Account access reviews
- **Compliance Reporting**: Security compliance tracking

## Troubleshooting

### Registration Issues

Common problems and solutions:

**Email Not Received**:
- Check spam/junk folders
- Verify SMTP configuration
- Confirm email address validity
- Check email server logs

**Activation Failures**:
- Verify activation link expiry
- Check network connectivity
- Review browser compatibility
- Clear browser cache/cookies

**Permission Problems**:
- Verify user role assignments
- Check domain configurations
- Review group memberships
- Validate resource policies

## Next Steps

After user registration:
1. **Set Up Permissions**: Configure [user permissions](permissions.md)
2. **Create Projects**: Organize users into [projects](../../usage/overview.md)
3. **Allocate Resources**: Set up [resource policies](../resources/policies.md)
4. **Monitor Usage**: Track [user activity](../maintenance/logs.md)