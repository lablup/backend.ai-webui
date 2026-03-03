# User Permissions

Backend.AI implements a comprehensive role-based permission system that controls what users can do within the platform. This system ensures security while providing flexible access control for different organizational needs.

## Permission Hierarchy

### Domain Level
Domains represent the highest level of organization and resource isolation in Backend.AI.

**Domain Admin Permissions:**
- Manage users within their domain
- Create and manage projects
- Allocate resource quotas
- Configure domain-specific settings
- View domain-wide analytics

### Project Level
Projects are collaborative workspaces within domains where users can share resources and work together.

**Project Admin Permissions:**
- Add/remove project members
- Manage project resource quotas
- Create shared storage folders
- Configure project settings
- Monitor project resource usage

**Project Member Permissions:**
- Access project resources
- Create sessions within project limits
- Access shared project folders
- Collaborate with other project members

### User Level
Individual user permissions that apply across all their project memberships.

**Standard User Permissions:**
- Create and manage personal sessions
- Access personal storage folders
- Join projects (when invited)
- Use compute resources (within limits)
- Access personal usage statistics

## Permission Matrix

| Action | Superadmin | Domain Admin | Project Admin | User |
|--------|------------|--------------|---------------|------|
| Create domains | ✓ | ✗ | ✗ | ✗ |
| Manage all users | ✓ | Domain only | Project only | Self only |
| Create projects | ✓ | ✓ | ✗ | ✗ |
| Allocate resources | ✓ | Within domain | Within project | Personal only |
| Access system logs | ✓ | Domain logs | Project logs | Personal logs |
| Modify system config | ✓ | Domain config | Project config | Personal config |

## Resource Permissions

### Compute Resources
- **CPU allocation**: Maximum cores per session
- **Memory limits**: RAM allocation per session
- **GPU access**: Types and quantities of GPU resources
- **Session duration**: Maximum session runtime
- **Concurrent sessions**: Number of simultaneous sessions

### Storage Permissions
- **Personal quota**: Individual storage limits
- **Project quota**: Shared storage allocation
- **Folder creation**: Permission to create new folders
- **Folder sharing**: Ability to share folders with others
- **Access levels**: Read-only vs read-write access

## Managing User Permissions

### Assigning Roles

**Creating Domain Admins:**
1. Superadmin assigns domain admin role
2. Specify which domains to manage
3. Set resource allocation limits
4. Configure permission scope

**Managing Project Membership:**
1. Project admin invites users
2. Specify role within project
3. Set individual resource limits
4. Configure access permissions

### Permission Inheritance
- Users inherit permissions from their highest role
- Project admins have all user permissions
- Domain admins have all project admin permissions
- Superadmins have all permissions

## Best Practices

### Security Guidelines
- Follow principle of least privilege
- Regularly audit user permissions
- Use project-based organization for collaboration
- Implement proper access controls for sensitive data

### Resource Management
- Set appropriate quotas to prevent resource exhaustion
- Monitor usage patterns and adjust limits accordingly
- Use resource groups to organize similar hardware
- Implement fair-share scheduling for shared resources

### User Onboarding
- Create standardized permission templates
- Provide clear documentation of available resources
- Set up proper project structures before adding users
- Train users on permission boundaries and best practices

This permission system provides the flexibility needed for various organizational structures while maintaining security and resource control essential for multi-tenant environments.