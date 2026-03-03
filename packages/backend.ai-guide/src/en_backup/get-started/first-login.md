# First Login and Setup

This guide walks you through the initial login process and basic setup of your Backend.AI environment.

## Accessing the Web UI

1. **Open your web browser** and navigate to your Backend.AI installation:
   - Local installation: `http://localhost:8080`
   - Remote installation: `https://your-domain.com`

2. **Accept SSL certificates** if prompted (for self-signed certificates in development)

## Initial Login

### Default Credentials

For fresh installations, use the default administrator credentials:
- **Email**: `admin@lablup.com`
- **Password**: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

:::warning
Change the default password immediately after first login for security.
:::

### First-Time Setup Wizard

1. **Accept Terms of Service**
   - Review and accept the terms of service
   - Configure privacy settings

2. **Change Default Password**
   - Enter a strong password
   - Confirm the new password
   - Update security questions (if enabled)

3. **Configure Basic Settings**
   - Set timezone and locale
   - Configure notification preferences
   - Set up user profile information

## User Account Configuration

### Profile Settings

Update your profile information:
- **Full Name**: Your display name
- **Organization**: Your company or institution
- **Role**: Your role or position
- **Contact Information**: Phone and additional email

### Security Settings

Configure security options:
- **Two-Factor Authentication**: Enable 2FA for enhanced security
- **API Keys**: Generate keys for programmatic access
- **Session Management**: Configure session timeout settings
- **Login Notifications**: Enable login alerts

## Domain and Project Setup

### Understanding Domains

Domains provide organizational boundaries:
- **Isolation**: Separate resources and users
- **Billing**: Track usage per organization
- **Policies**: Apply different rules per domain

### Creating Projects

Projects organize work within a domain:
1. Navigate to **Projects** in the sidebar
2. Click **Create Project**
3. Enter project details:
   - Name and description
   - Resource limits
   - Member permissions

## Initial Resource Allocation

### Default Resource Policies

Configure basic resource limits:
- **CPU Cores**: Default allocation per session
- **Memory**: RAM limits for users
- **GPU**: Graphics processing units (if available)
- **Storage**: Persistent storage quotas

### Environment Images

Set up computing environments:
- **Python**: Data science and machine learning
- **R**: Statistical computing
- **Julia**: High-performance scientific computing
- **Custom**: Your own container images

## Verification Steps

### Test Basic Functionality

1. **Create a Test Session**:
   - Go to Sessions page
   - Click "Start Session"
   - Select Python environment
   - Verify session launches successfully

2. **Test Storage**:
   - Navigate to Data page
   - Create a new folder
   - Upload a test file
   - Verify file operations work

3. **Check Resource Monitoring**:
   - View session resource usage
   - Monitor system performance
   - Verify alerts and notifications

## Troubleshooting Common Issues

### Login Problems
- **Invalid credentials**: Verify username and password
- **Account locked**: Contact administrator
- **SSL certificate errors**: Check certificate configuration

### Session Creation Issues
- **No available resources**: Check resource allocation
- **Image not found**: Verify container images are available
- **Permission denied**: Check user permissions and policies

### Storage Access Problems
- **Folder creation failed**: Verify storage permissions
- **Upload errors**: Check file size limits and network connectivity
- **Permission denied**: Verify folder access rights

## Next Steps

After completing the initial setup:

1. **Explore the Interface**: Familiarize yourself with the [Web UI layout](../usage/overview.md)
2. **Create Your First Session**: Learn about [session management](first-session.md)
3. **Set Up Storage**: Configure [data storage](storage.md)
4. **Invite Team Members**: Add [users and permissions](../admin/users/registration.md)

For advanced configuration options, see:
- [User Management](../admin/users/permissions.md)
- [Resource Policies](../admin/resources/policies.md)
- [System Configuration](../admin/config/global.md)