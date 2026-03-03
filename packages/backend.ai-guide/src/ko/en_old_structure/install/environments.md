# Environments and Prerequisites

Before installing Backend.AI, ensure your environment meets the necessary requirements and prerequisites.

## System Requirements

### Minimum Requirements
- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **CPU**: 2 cores
- **Memory**: 4GB RAM
- **Storage**: 20GB available space
- **Network**: Internet connectivity for downloads

### Recommended Requirements
- **Operating System**: Ubuntu 22.04 LTS
- **CPU**: 8 cores or more
- **Memory**: 16GB RAM or more
- **Storage**: 100GB+ SSD storage
- **Network**: High-speed internet connection

## Software Dependencies

### Required Software
- **Docker**: Version 20.10 or later
- **Docker Compose**: Version 2.0 or later
- **Python**: Version 3.9 or later (for CLI tools)
- **Git**: For source code management

### Optional Software
- **NVIDIA Docker**: For GPU support
- **Kubernetes**: For production deployments
- **PostgreSQL**: For external database (optional)
- **Redis**: For external caching (optional)

## Network Configuration

### Port Requirements
- **8080**: Web UI access
- **8081**: Manager API
- **6379**: Redis (if external)
- **5432**: PostgreSQL (if external)
- **Custom ports**: Agent communication

### Firewall Settings
Ensure the following ports are accessible:
- Inbound: 8080, 8081
- Outbound: 443 (HTTPS), 80 (HTTP)
- Internal: Agent communication ports

## Storage Requirements

### Local Storage
- Container images: 10-50GB
- User data: Variable based on usage
- System logs: 1-5GB
- Temporary files: 5-10GB

### Shared Storage (Optional)
- NFS, Ceph, or cloud storage
- High IOPS for better performance
- Backup and disaster recovery support

## Security Considerations

### Access Control
- SSH key-based authentication
- Role-based access control (RBAC)
- Network segmentation
- SSL/TLS encryption

### Compliance
- Data encryption at rest
- Audit logging
- Compliance with organizational policies
- Security monitoring

## Next Steps

After verifying your environment:
1. Choose your [installation method](single-node/docker-compose.md)
2. Follow the [installation guide](single-node/docker-compose.md)
3. Complete the [initial setup](../get-started/first-login.md)